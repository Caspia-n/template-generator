"use client";
import { useState, useEffect } from "react";
import { Card } from "@heroui/react";
import { useToast } from "./Toasts";
import { motion } from "framer-motion";

export function ModelPicker() {
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>("");
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    // Load saved model path from localStorage on mount
    const saved = localStorage.getItem("selectedModelPath");
    const savedName = localStorage.getItem("selectedModelName");
    
    if (saved) {
      setModelPath(saved);
      setModelName(savedName || "Model Selected");
    }
  }, []);

  const handleFileSelect = async (
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

      // Store file info
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
            <p className="text-sm text-slate-400 mb-2">AI Model (GGUF)</p>
            {modelPath ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-green-400">
                    {modelName}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Ready to generate
                  </p>
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
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-slate-500 mt-2">
              Requirements: GGUF format, minimum 100MB
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
