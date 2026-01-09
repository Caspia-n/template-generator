export interface ElectronAPI {
  openFileDialog: () => Promise<{
    canceled: boolean;
    filePath?: string;
    filename?: string;
    size?: number;
    sizeGB?: string;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
