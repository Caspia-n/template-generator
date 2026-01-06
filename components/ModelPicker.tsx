"use client";
import { useState, useEffect } from "react";
import { Button, Card, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { useToast } from "./Toasts";
import { motion } from "framer-motion";

export function ModelPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>("");
  const [isValidating, setIsValidating] = useState(false);
  const [manualPath, setManualPath] = useState("");
  const toast = useToast();

  useEffect(() => {
    // Load saved model path from localStorage on mount
    const saved = localStorage.getItem("selectedModelPath");
    const savedName = localStorage.getItem("selectedModelName");
    if (saved) {
      setModelPath(saved);
      setModelName(savedName || "Model Selected");
    } else {
      setIsOpen(true); // Open on first load if no model selected
    }
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsValidating(true);
    try {
      // Validate file
      if (!file.name.toLowerCase().endsWith(".gguf")) {
        throw new Error("File must be a .gguf model file");
      }

      if (file.size < 100 * 1024 * 1024) {
        throw new Error("Model file must be at least 100MB");
      }

      // Store file path info
      const path = (file as any).path || file.webkitRelativePath || file.name;
      
      // Save to localStorage
      localStorage.setItem("selectedModelPath", path);
      localStorage.setItem("selectedModelName", file.name);
      
      setModelPath(path);
      setModelName(file.name);
      setIsOpen(false);
      
      toast.success(`Model selected: ${file.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to select model");
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualPath = async () => {
    if (!manualPath.trim()) {
      toast.error("Please enter a valid file path");
      return;
    }

    setIsValidating(true);
    try {
      // Call API to validate the path
      const res = await fetch("/api/models/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelPath: manualPath }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid model path");
      }

      // Extract filename from path
      const filename = manualPath.split("/").pop() || "Model";
      
      localStorage.setItem("selectedModelPath", manualPath);
      localStorage.setItem("selectedModelName", filename);
      
      setModelPath(manualPath);
      setModelName(filename);
      setManualPath("");
      setIsOpen(false);
      
      toast.success(`Model selected: ${filename}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to validate model");
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearSelection = () => {
    localStorage.removeItem("selectedModelPath");
    localStorage.removeItem("selectedModelName");
    setModelPath(null);
    setModelName("");
    setIsOpen(true);
    toast.success("Model selection cleared");
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
                  <p className="text-lg font-semibold text-green-400">{modelName}</p>
                  <p className="text-xs text-slate-500 mt-1">Ready to generate</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-yellow-400">No Model Selected</p>
                  <p className="text-xs text-slate-400 mt-1">Click below to select a GGUF model</p>
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
                onPress={() => setIsOpen(true)}
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
      <Modal isOpen={isOpen} onOpenChange={setIsOpen} size="lg">
        <ModalContent>
          <ModalHeader>Select AI Model (GGUF)</ModalHeader>
          <Divider />
          <ModalBody className="py-6">
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-300 mb-2">📝 Instructions</p>
                <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside">
                  <li>Download a GGUF model (e.g., Qwen3-30B) from Hugging Face</li>
                  <li>Save it to your local machine</li>
                  <li>Select it below using the file picker or enter the path manually</li>
                </ol>
              </div>

              {/* File Picker */}
              <div>
                <p className="text-sm font-medium mb-2">Upload from Computer</p>
                <Input
                  type="file"
                  accept=".gguf"
                  onChange={handleFileSelect}
                  isDisabled={isValidating}
                  className="cursor-pointer"
                />
              </div>

              <Divider />

              {/* Manual Path Entry */}
              <div>
                <p className="text-sm font-medium mb-2">Or Enter File Path</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="/home/user/models/qwen-30b.gguf"
                    value={manualPath}
                    onValueChange={setManualPath}
                    isDisabled={isValidating}
                  />
                  <Button
                    onPress={handleManualPath}
                    color="primary"
                    isLoading={isValidating}
                    isDisabled={isValidating}
                  >
                    Validate
                  </Button>
                </div>
              </div>

              {/* Help Text */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-400">
                  <strong>Requirements:</strong> GGUF format, minimum 100MB, compatible with llama.cpp
                </p>
              </div>
            </div>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsOpen(false)}
              isDisabled={isValidating}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
