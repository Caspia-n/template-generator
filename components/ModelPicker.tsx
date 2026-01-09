"use client";
import { useState, useEffect } from "react";
import { Card } from "@heroui/react";
import { useToast } from "./Toasts";
import { motion } from "framer-motion";

export function ModelPicker() {
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>("");
  const [isElectron, setIsElectron] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    // Check if running in Electron
    setIsElectron(typeof window !== 'undefined' && !!window.electron);
    
    // Load saved model path from localStorage on mount
    const saved = localStorage.getItem("selectedModelPath");
    const savedName = localStorage.getItem("selectedModelName");
    
    if (saved) {
      setModelPath(saved);
      setModelName(savedName || "Model Selected");
    }
  }, []);

  const handleElectronFileSelect = async () => {
    if (!window.electron) {
      toastError("Electron API not available");
      return;
    }

    try {
      const result = await window.electron.openFileDialog();
      
      if (result.canceled) {
        return;
      }

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.filePath) {
        throw new Error("No file path returned");
      }

      // Validate file
      if (!result.filename?.toLowerCase().endsWith(".gguf")) {
        throw new Error("File must be a .gguf model file");
      }

      if (result.size && result.size < 100 * 1024 * 1024) {
        throw new Error("Model file must be at least 100MB");
      }

      // Store file info with full path
      localStorage.setItem("selectedModelPath", result.filePath);
      localStorage.setItem("selectedModelName", result.filename);

      setModelPath(result.filePath);
      setModelName(result.filename);

      toastSuccess(`Model selected: ${result.filename} (${result.sizeGB} GB)`);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to select model";
      toastError(errorMsg);
    }
  };

  const handleBrowserFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    try {
      // Validate file
      if (!file.name.toLowerCase().endsWith(".gguf")) {
        throw new Error("File must be a .gguf model file");
      }

      if (file.size < 100 * 1024 * 1024) {
        throw new Error("Model file must be at least 100MB");
      }

      // Store file info (only filename in browser mode)
      const filename = file.name;
      const fileSizeGB = (file.size / (1024 ** 3)).toFixed(2);

      localStorage.setItem("selectedModelPath", filename);
      localStorage.setItem("selectedModelName", filename);

      setModelPath(filename);
      setModelName(filename);

      toastSuccess(`Model selected: ${filename} (${fileSizeGB} GB)`);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to select model";
      toastError(errorMsg);
    }

    // Reset file input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleClearSelection = () => {
    localStorage.removeItem("selectedModelPath");
    localStorage.removeItem("selectedModelName");
    setModelPath(null);
    setModelName("");
    toastSuccess("Model selection cleared");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full p-4 bg-slate-800 border border-slate-700">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-400 mb-2">
              AI Model (GGUF) {isElectron && <span className="text-green-500">• Electron</span>}
            </p>
            {modelPath ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-green-400">
                    {modelName}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Ready to generate
                  </p>
                  {isElectron && (
                    <p className="text-xs text-slate-600 mt-1 truncate max-w-md">
                      {modelPath}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClearSelection}
                  className="text-slate-400 hover:text-red-400 text-xl px-2"
                  aria-label="Clear selection"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <p className="text-lg font-semibold text-yellow-400 mb-1">
                  No Model Selected
                </p>
                <p className="text-xs text-slate-400 mb-3">
                  Select a GGUF model file to proceed
                </p>
              </>
            )}
          </div>

          {/* File Picker */}
          <div>
            {isElectron ? (
              <button
                onClick={handleElectronFileSelect}
                className="block w-full px-4 py-2 text-center text-sm font-semibold rounded-md border
                  bg-slate-700 text-slate-100 border-slate-600
                  hover:bg-slate-600 transition-colors"
              >
                {modelPath ? "Change Model" : "Select Model File"}
              </button>
            ) : (
              <>
                <label
                  htmlFor="model-file-input"
                  className="block w-full px-4 py-2 text-center text-sm font-semibold rounded-md border
                    bg-slate-700 text-slate-100 border-slate-600
                    hover:bg-slate-600 cursor-pointer transition-colors"
                >
                  {modelPath ? "Change Model" : "Select Model File"}
                </label>
                <input
                  id="model-file-input"
                  type="file"
                  accept=".gguf"
                  onChange={handleBrowserFileSelect}
                  className="hidden"
                />
              </>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Requirements: GGUF format, minimum 100MB
              {!isElectron && (
                <span className="block mt-1 text-yellow-500">
                  Note: Browser mode only stores filename, not full path
                </span>
              )}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
