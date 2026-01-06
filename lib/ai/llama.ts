import { getLlama, LlamaModel, LlamaContext } from "node-llama-cpp";
import * as fs from "fs/promises";

let llamaInstance: Awaited<ReturnType<typeof getLlama>> | null = null;
let loadedModel: LlamaModel | null = null;
let currentModelPath: string | null = null;

export async function initializeLlama() {
  try {
    if (llamaInstance) return llamaInstance;

    console.log("[Llama] Initializing Llama instance...");
    llamaInstance = await getLlama();
    console.log("[Llama] Llama initialized successfully");
    return llamaInstance;
  } catch (error) {
    console.error("[Llama] Failed to initialize:", error);
    throw error;
  }
}

export async function validateModel(modelPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(modelPath);
    const isGGUF = modelPath.toLowerCase().endsWith(".gguf");
    const isLargeEnough = stat.size > 100 * 1024 * 1024; // At least 100MB
    
    return isGGUF && isLargeEnough;
  } catch (error) {
    console.error("[Model] Validation failed:", error);
    return false;
  }
}

export async function loadModel(modelPath: string) {
  try {
    // Validate model path
    const isValid = await validateModel(modelPath);
    if (!isValid) {
      throw new Error("Invalid model file. Must be a .gguf file at least 100MB.");
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
}

export function getCurrentModelPath(): string | null {
  return currentModelPath;
}

export async function createChatSession(model: LlamaModel) {
  const context = await model.createContext();
  return {
    context,
    messages: [] as Array<{ role: string; content: string }>,
  };
}

export async function getModelStatus() {
  return {
    available: loadedModel !== null,
    loading: false,
    model_path: currentModelPath,
  };
}

export async function dispose() {
  if (loadedModel) {
    loadedModel.dispose();
    loadedModel = null;
  }
  if (llamaInstance) {
    llamaInstance = null;
  }
  currentModelPath = null;
}
