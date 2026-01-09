"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Separator,
  Input,
  Modal,
  Alert,
  useOverlayState,
} from "@heroui/react";
import { useToast } from "./Toasts";
import { motion } from "framer-motion";

export function ModelPicker() {
  const modalState = useOverlayState();
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>("");
  const [isValidating, setIsValidating] = useState(false);
  const [manualPath, setManualPath] = useState("");
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    // Load saved model path from localStorage on mount
    const saved = localStorage.getItem("selectedModelPath");
    const savedName = localStorage.getItem("selectedModelName");
    console.log("[ModelPicker] Component mounted, checking localStorage:", {
      hasPath: !!saved,
      path: saved,
      name: savedName
    });
    
    if (saved) {
      setModelPath(saved);
      setModelName(savedName || "Model Selected");
      console.log("[ModelPicker] Model loaded from localStorage:", {
        path: saved,
        name: savedName || "Model Selected"
      });
    } else {
      console.log("[ModelPicker] No saved model found, opening modal");
      modalState.open(); // Open on first load if no model selected
    }
  }, []);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    console.log("[ModelPicker] File input changed, files:", event.target.files);
    
    if (!file) {
      console.log("[ModelPicker] No file selected");
      return;
    }

    console.log("[ModelPicker] File selected:", {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2)
    });

    try {
      // Validate file
      if (!file.name.toLowerCase().endsWith(".gguf")) {
        console.log("[ModelPicker] File validation failed: not a .gguf file");
        throw new Error("File must be a .gguf model file");
      }

      if (file.size < 100 * 1024 * 1024) {
        console.log("[ModelPicker] File validation failed: too small", file.size);
        throw new Error("Model file must be at least 100MB");
      }

      console.log("[ModelPicker] File validation passed");

      // Browser security limitation explanation
      const message = `File selected: ${file.name} (${(file.size / (1024 ** 3)).toFixed(2)} GB)

However, browsers cannot access file system paths for security reasons.
You'll need to manually enter the file path to proceed.

Quick steps:
1. Find your .gguf file on your computer
2. Right-click and "Copy as path" (Windows) or copy from file properties
3. Use the "Enter File Path" section below to paste the full path
4. Click Validate to proceed

Example paths:
• Windows: C:\\Users\\YourName\\Downloads\\model.gguf
• Mac: /Users/YourName/Downloads/model.gguf
• Linux: /home/username/Downloads/model.gguf`;

      toastError(message);
      console.log("[ModelPicker] Browser limitation message shown, user must use manual path entry");

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to select model";
      console.error("[ModelPicker] Error during file selection:", err);
      toastError(errorMsg);
    }

    // Reset file input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleManualPath = async () => {
    if (!manualPath.trim()) {
      console.log("[ModelPicker] Manual path validation failed: empty path");
      toastError("Please enter a valid file path");
      return;
    }

    console.log("[ModelPicker] Starting manual path validation:", manualPath);
    setIsValidating(true);

    try {
      // Call API to validate the path
      console.log("[ModelPicker] Sending validation request to /api/models/validate");
      const res = await fetch("/api/models/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelPath: manualPath }),
      });

      console.log("[ModelPicker] Validation response status:", res.status);
      
      if (!res.ok) {
        const data = await res.json();
        console.error("[ModelPicker] Validation failed:", {
          status: res.status,
          error: data.error
        });
        throw new Error(data.error || "Invalid model path");
      }

      const data = await res.json();
      console.log("[ModelPicker] Validation successful:", data);

      // Extract filename from path - handle both Unix and Windows paths
      const filename = manualPath.split(/[\\/]/).pop() || "Model";

      console.log("[ModelPicker] Saving to localStorage:", {
        path: manualPath,
        name: filename,
        size: data.size
      });

      localStorage.setItem("selectedModelPath", manualPath);
      localStorage.setItem("selectedModelName", filename);

      setModelPath(manualPath);
      setModelName(filename);
      setManualPath("");
      modalState.close();

      toastSuccess(`Model selected: ${filename} (${data.size})`);
      console.log("[ModelPicker] Model selection completed successfully");

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to validate model";
      console.error("[ModelPicker] Manual path validation error:", err);
      toastError(errorMsg);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearSelection = () => {
    console.log("[ModelPicker] Clearing model selection");
    localStorage.removeItem("selectedModelPath");
    localStorage.removeItem("selectedModelName");
    setModelPath(null);
    setModelName("");
    setManualPath("");
    modalState.open();
    toastSuccess("Model selection cleared");
    console.log("[ModelPicker] Model selection cleared, localStorage cleared, modal opened");
  };

  return (
    <>
      {/* Model Status Display */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full p-4 bg-slate-800 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">AI Model</p>
              {modelPath ? (
                <>
                  <p className="text-lg font-semibold text-green-400">
                    {modelName}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Ready to generate
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-yellow-400">
                    No Model Selected
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click below to select a GGUF model
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {modelPath && (
                <Button
                  isIconOnly
                  variant="light"
                  onPress={handleClearSelection}
                  className="text-slate-400 hover:text-red-400"
                >
                  ✕
                </Button>
              )}
              <Button
                onPress={() => {
                  console.log("[ModelPicker] Opening model picker modal");
                  modalState.open();
                }}
                color={modelPath ? "default" : "primary"}
                size="sm"
              >
                {modelPath ? "Change" : "Select"}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Model Picker Modal */}
      <Modal state={modalState}>
        <Modal.Backdrop />
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>Select AI Model (GGUF)</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Separator />
            <Modal.Body className="py-6">
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-300 mb-2">
                    📝 How to Select Your Model
                  </p>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                    <li>
                      Download a GGUF model from{" "}
                      <a
                        href="https://huggingface.co/unsloth/Qwen3-30B-A3B-Instruct-2507-UD-GGUF"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Hugging Face
                      </a>
                    </li>
                    <li>Save it to your computer (e.g., Downloads folder)</li>
                    <li>
                      Copy the full file path (step-by-step below)
                    </li>
                    <li>Paste it in the "Enter File Path" field and click Validate</li>
                  </ol>
                </div>

                <Separator />

                {/* How to Get File Path */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-300 mb-3">
                    📍 How to Find Your File Path
                  </p>
                  <div className="space-y-3 text-xs text-slate-400">
                    <div>
                      <p className="font-medium text-slate-300 mb-1">Windows:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Right-click your .gguf file</li>
                        <li>Click "Copy as path"</li>
                        <li>
                          Paste below (e.g., C:\\Users\\YourName\\Downloads\\model.gguf)
                        </li>
                      </ol>
                    </div>
                    <Separator className="my-2" />
                    <div>
                      <p className="font-medium text-slate-300 mb-1">Mac/Linux:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Open Terminal in the folder with your model</li>
                        <li>Type: pwd (press Enter)</li>
                        <li>Copy the path, add /model.gguf</li>
                        <li>
                          Paste below (e.g., /Users/YourName/Downloads/model.gguf)
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Manual Path Entry - RECOMMENDED METHOD */}
                <div>
                  <p className="text-sm font-semibold mb-3 text-slate-200">
                    Enter File Path (Recommended)
                  </p>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <Input
                      placeholder="/home/user/Downloads/model.gguf"
                      value={manualPath}
                      onChange={(e) => setManualPath(e.target.value)}
                      isDisabled={isValidating}
                      className="flex-1"
                      description="Full path to your GGUF model file"
                    />
                    <Button
                      onPress={handleManualPath}
                      color="primary"
                      isLoading={isValidating}
                      isDisabled={isValidating || !manualPath.trim()}
                      className="sm:self-end"
                    >
                      Validate
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* File Picker - Reference Only */}
                <div>
                  <p className="text-sm font-semibold mb-2 text-slate-200">
                    Or Select File (Reference)
                  </p>
                  <Alert status="warning">
                    <Alert.Content>
                      <Alert.Title>Browser Limitation</Alert.Title>
                      <Alert.Description>
                        Browsers cannot access file paths for security. Use the path entry method above.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>
                  <input
                    type="file"
                    accept=".gguf"
                    onChange={handleFileSelect}
                    disabled={isValidating}
                    className="mt-3 block w-full text-sm text-slate-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-slate-700 file:text-slate-100
                      hover:file:bg-slate-600
                      cursor-pointer disabled:opacity-50"
                  />
                </div>

                {/* Help Text */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-400">
                    <strong>Requirements:</strong> GGUF format, minimum 100MB,
                    compatible with llama.cpp. Typical models are 30-40GB.
                  </p>
                </div>
              </div>
            </Modal.Body>
            <Separator />
            <Modal.Footer>
              <Button
                color="danger"
                variant="light"
                onPress={() => modalState.close()}
                isDisabled={isValidating}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </>
  );
}
