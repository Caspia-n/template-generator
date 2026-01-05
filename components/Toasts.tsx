'use client';

import toast from 'react-hot-toast';
import type { GenerationResponse, ApiResponse } from '@/lib/types';

/**
 * Toast notification hooks for the application
 */
export function useToasts() {
  const showSuccess = (message: string, duration?: number) => {
    toast.success(message, { duration });
  };

  const showError = (message: string, duration?: number) => {
    toast.error(message, { duration });
  };

  const showInfo = (message: string, duration?: number) => {
    toast(message, { 
      duration,
      icon: 'ℹ️',
    });
  };

  const showWarning = (message: string, duration?: number) => {
    toast(message, { 
      duration,
      icon: '⚠️',
      style: {
        background: '#fef3c7',
        color: '#92400e',
        border: '1px solid #f59e0b',
      },
    });
  };

  const showLoading = (message: string) => {
    return toast.loading(message);
  };

  const dismiss = (toastId?: string | number | undefined) => {
    toast.dismiss(toastId);
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismiss,
  };
}

/**
 * Specific toast functions for common use cases
 */
export const toasts = {
  // Template generation
  templateGenerationStarted: () => {
    toast.loading('Generating your template...', { id: 'template-gen' });
  },

  templateGenerationSuccess: (templateTitle: string) => {
    toast.success(`Template "${templateTitle}" generated successfully!`, { 
      id: 'template-gen',
      duration: 5000,
    });
  },

  templateGenerationError: (error: string) => {
    toast.error(`Template generation failed: ${error}`, { 
      id: 'template-gen',
      duration: 6000,
    });
  },

  // Notion operations
  notionAuthSuccess: () => {
    toast.success('Connected to Notion successfully!');
  },

  notionAuthError: (error: string) => {
    toast.error(`Notion connection failed: ${error}`);
  },

  notionPageCreated: (pageTitle: string) => {
    toast.success(`Notion page "${pageTitle}" created!`);
  },

  notionPageError: (error: string) => {
    toast.error(`Notion operation failed: ${error}`);
  },

  // MCP operations
  mcpConnectionSuccess: (serverName: string) => {
    toast.success(`Connected to ${serverName} MCP server`);
  },

  mcpConnectionError: (serverName: string, error: string) => {
    toast.error(`${serverName} MCP connection failed: ${error}`);
  },

  mcpToolCallSuccess: (toolName: string) => {
    toast.success(`${toolName} executed successfully`);
  },

  mcpToolCallError: (toolName: string, error: string) => {
    toast.error(`${toolName} failed: ${error}`);
  },

  // Model operations
  modelDownloadStarted: (modelName: string) => {
    toast.loading(`Downloading ${modelName} model...`, { id: 'model-download' });
  },

  modelDownloadSuccess: (modelName: string) => {
    toast.success(`${modelName} model downloaded successfully!`, { 
      id: 'model-download',
      duration: 4000,
    });
  },

  modelDownloadError: (modelName: string, error: string) => {
    toast.error(`${modelName} download failed: ${error}`, { 
      id: 'model-download',
      duration: 6000,
    });
  },

  modelLoadSuccess: (modelName: string) => {
    toast.success(`${modelName} model loaded successfully!`);
  },

  modelLoadError: (modelName: string, error: string) => {
    toast.error(`${modelName} model load failed: ${error}`);
  },

  // Storage operations
  templateSaved: (templateTitle: string) => {
    toast.success(`Template "${templateTitle}" saved`);
  },

  templateDeleted: (templateTitle: string) => {
    toast.success(`Template "${templateTitle}" deleted`);
  },

  templateShared: (templateTitle: string) => {
    toast.success(`Template "${templateTitle}" is now public`);
  },

  storageError: (error: string) => {
    toast.error(`Storage operation failed: ${error}`);
  },

  // API operations
  apiError: (endpoint: string, error: string) => {
    toast.error(`API error (${endpoint}): ${error}`);
  },

  apiSuccess: (endpoint: string) => {
    toast.success(`${endpoint} operation completed`);
  },

  // Validation errors
  validationError: (field: string, message: string) => {
    toast.error(`${field}: ${message}`, {
      duration: 5000,
    });
  },

  // Generic errors
  unexpectedError: (context: string, error: string) => {
    toast.error(`Unexpected error in ${context}: ${error}`, {
      duration: 6000,
    });
  },

  // Success confirmations
  operationSuccess: (operation: string, details?: string) => {
    const message = details ? `${operation}: ${details}` : operation;
    toast.success(message, { duration: 3000 });
  },

  // Progress updates
  progressUpdate: (step: string, progress: number) => {
    toast.loading(`${step} (${Math.round(progress)}%)`, { 
      id: 'progress',
      duration: Infinity,
    });
  },

  progressComplete: (step: string) => {
    toast.success(`${step} completed!`, { id: 'progress' });
  },

  // Additional utility functions
  showSuccess: (message: string, duration?: number) => {
    toast.success(message, { duration });
  },

  showError: (message: string, duration?: number) => {
    toast.error(message, { duration });
  },

  showInfo: (message: string, duration?: number) => {
    toast(message, { 
      duration,
      icon: 'ℹ️',
    });
  },

  showWarning: (message: string, duration?: number) => {
    toast(message, { 
      duration,
      icon: '⚠️',
      style: {
        background: '#fef3c7',
        color: '#92400e',
        border: '1px solid #f59e0b',
      },
    });
  },

  showLoading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId?: string | number | undefined) => {
    toast.dismiss(toastId);
  },
};

/**
 * Handle API responses with appropriate toast notifications
 */
export function handleApiResponse<T>(
  response: ApiResponse<T>,
  context: string,
  showSuccessToast = true
): { success: boolean; data?: T; error?: string } {
  if (response.success && response.data) {
    if (showSuccessToast) {
      toasts.operationSuccess(context, 'Operation completed successfully');
    }
    return { success: true, data: response.data };
  }

  const errorMessage = response.error?.message || 'Unknown error occurred';
  toasts.apiError(context, errorMessage);
  return { success: false, error: errorMessage };
}

/**
 * Handle generation responses with toast notifications
 */
export function handleGenerationResponse(
  response: GenerationResponse,
  templateTitle?: string
): { success: boolean; template?: any; error?: string } {
  if (response.success && response.template) {
    const title = templateTitle || response.template.title || 'Template';
    toasts.templateGenerationSuccess(title);
    return { success: true, template: response.template };
  }

  const errorMessage = response.error?.message || 'Generation failed';
  toasts.templateGenerationError(errorMessage);
  return { success: false, error: errorMessage };
}

/**
 * Show contextual loading states
 */
export const loadingStates = {
  generating: () => toasts.templateGenerationStarted(),
  
  downloading: (modelName: string) => toasts.modelDownloadStarted(modelName),
  
  connecting: (service: string) => toast.loading(`Connecting to ${service}...`, { id: 'connecting' }),
  
  saving: (item: string) => toast.loading(`Saving ${item}...`, { id: 'saving' }),
  
  updating: (item: string) => toast.loading(`Updating ${item}...`, { id: 'updating' }),
  
  loading: (item: string) => toast.loading(`Loading ${item}...`, { id: 'loading' }),
};