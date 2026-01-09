# Electron Desktop App

This application now supports running as an Electron desktop app, which enables full file system access for selecting GGUF model files with their complete paths.

## Why Electron?

The browser version has limitations due to security restrictions - it can only access the filename, not the full file path needed by the backend. The Electron version solves this by providing native file dialogs with full path access.

## Installation

Install the additional dependencies:

```bash
npm install
```

This will install:
- `electron` - The Electron framework
- `electron-builder` - For building distributable packages
- `concurrently` - To run Next.js and Electron together
- `cross-env` - For cross-platform environment variables
- `wait-on` - To wait for Next.js server to start

## Running in Development

To run the app in Electron during development:

```bash
npm run electron:dev
```

This will:
1. Start the Next.js development server
2. Wait for it to be ready
3. Launch the Electron window

## Running in Browser Mode (Original)

You can still run it as a regular web app:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Building for Production

To build a distributable Electron app:

```bash
npm run electron:build
```

This will create platform-specific installers in the `dist/` directory:
- **macOS**: `.dmg` file
- **Windows**: `.exe` installer  
- **Linux**: `.AppImage` file

## Features in Electron Mode

When running in Electron, you get:

✅ **Full file path access** - The backend receives the complete file path to the GGUF model
✅ **Native file dialog** - OS-native file picker with better UX
✅ **File validation** - Proper file size and format checking
✅ **Desktop integration** - Runs as a standalone app

## File Structure

```
electron/
├── main.js      # Electron main process
└── preload.js   # Preload script for IPC communication
```

## How It Works

1. The `ModelPicker` component detects if running in Electron
2. In Electron mode, it uses `window.electron.openFileDialog()` instead of HTML file input
3. The Electron main process handles the file dialog and returns the full file path
4. The full path is stored in localStorage and used by the backend

## Troubleshooting

**Issue**: Electron window shows blank screen
- **Solution**: Make sure Next.js dev server is running on port 3000 first

**Issue**: File dialog doesn't open
- **Solution**: Check the Electron console for errors (View > Toggle Developer Tools)

**Issue**: Model path not working in backend
- **Solution**: Ensure you're using the Electron version, not browser version
