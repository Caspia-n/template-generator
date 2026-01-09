/**
 * Electron API exposed to the renderer process
 */
export interface ElectronAPI {
  /**
   * Opens a native file dialog for selecting GGUF model files
   * @returns Promise that resolves with file information or cancellation status
   */
  openFileDialog: () => Promise<{
    /** Whether the user canceled the dialog */
    canceled: boolean;
    /** Full filesystem path to the selected file (only if not canceled) */
    filePath?: string;
    /** Name of the selected file (only if not canceled) */
    filename?: string;
    /** Size of the file in bytes (only if not canceled) */
    size?: number;
    /** Size of the file in GB, formatted to 2 decimal places (only if not canceled) */
    sizeGB?: string;
    /** Error message if file reading failed (only if error occurred) */
    error?: string;
  }>;
}

declare global {
  interface Window {
    /** Electron API - only available when running in Electron */
    electron?: ElectronAPI;
  }
}

export {};
