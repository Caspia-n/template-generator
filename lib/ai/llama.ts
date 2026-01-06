import type { LlamaModel } from "node-llama-cpp";
import * as fs from "fs/promises";

// Gate full llama support behind an env var so that the bundler doesn't try to
// resolve platform-specific native packages during build.
const ENABLE_LLAMA = process.env.ENABLE_LOCAL_LLAMA === "true";

// Export mutable bindings so we can swap in real implementations when enabled.
export let initializeLlama: () => Promise<any> = async () => null;
export let validateModel: (path: string) => Promise<boolean> = async () =>
  false;
export let loadModel: (path: string) => Promise<any> = async () => {
  throw new Error(
    "Local llama support is disabled. Set ENABLE_LOCAL_LLAMA=true to enable it."
  );
};
export let getCurrentModelPath: () => string | null = () => null;
export let createChatSession: (
  model: LlamaModel
) => Promise<any> = async () => {
  throw new Error("Local llama support is disabled.");
};
export let getModelStatus: () => Promise<{
  available: boolean;
  loading: boolean;
  model_path: string | null;
}> = async () => ({ available: false, loading: false, model_path: null });
export let dispose: () => Promise<void> = async () => {};

if (ENABLE_LLAMA) {
  // Avoid top-level import of `node-llama-cpp` so the bundler doesn't eagerly resolve
  // platform-specific native modules that may not be present at build-time.
  let getLlamaFn: any = null;
  let llamaInstance: any = null;
  let loadedModel: LlamaModel | null = null;
  let currentModelPath: string | null = null;

  initializeLlama = async function () {
    try {
      if (llamaInstance) return llamaInstance;

      // Dynamically import only at runtime on the server
      if (!getLlamaFn) {
        const module = await import("node-llama-cpp");
        getLlamaFn = module.getLlama;
      }

      console.log("[Llama] Initializing Llama instance...");
      llamaInstance = await getLlamaFn();
      console.log("[Llama] Llama initialized successfully");
      return llamaInstance;
    } catch (error) {
      console.error("[Llama] Failed to initialize:", error);
      throw error;
    }
  };

  validateModel = async function (modelPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(modelPath);
      const isGGUF = modelPath.toLowerCase().endsWith(".gguf");
      const isLargeEnough = stat.size > 100 * 1024 * 1024; // At least 100MB

      return isGGUF && isLargeEnough;
    } catch (error) {
      console.error("[Model] Validation failed:", error);
      return false;
    }
  };

  loadModel = async function (modelPath: string) {
    try {
      // Validate model path
      const isValid = await validateModel(modelPath);
      if (!isValid) {
        throw new Error(
          "Invalid model file. Must be a .gguf file at least 100MB."
        );
      }

      // If same model already loaded, return it
      if (currentModelPath === modelPath && loadedModel) {
        return loadedModel;
      }

      // Dispose of old model if different
      if (loadedModel && currentModelPath !== modelPath) {
        console.log("[Model] Unloading previous model");
        loadedModel.dispose();
        loadedModel = null;
      }

      const llama = await initializeLlama();
      console.log("[Model] Loading model from:", modelPath);

      loadedModel = await llama.loadModel({
        modelPath: modelPath,
      });

      currentModelPath = modelPath;
      console.log("[Model] Model loaded successfully");
      return loadedModel;
    } catch (error) {
      console.error("[Model] Failed to load model:", error);
      throw error;
    }
  };

  getCurrentModelPath = function (): string | null {
    return currentModelPath;
  };

  createChatSession = async function (model: LlamaModel) {
    const context = await model.createContext();
    return {
      context,
      messages: [] as Array<{ role: string; content: string }>,
    };
  };

  getModelStatus = async function () {
    return {
      available: loadedModel !== null,
      loading: false,
      model_path: currentModelPath,
    };
  };

  dispose = async function () {
    if (loadedModel) {
      loadedModel.dispose();
      loadedModel = null;
    }
    if (llamaInstance) {
      llamaInstance = null;
    }
    currentModelPath = null;
  };
}
