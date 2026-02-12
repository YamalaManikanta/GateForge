export const isElectron = (): boolean => {
  return /electron/i.test(navigator.userAgent);
};

export const saveFileToDisk = (base64Data: string, fileName: string): string => {
  if (!isElectron()) {
    console.warn("Not in Electron mode. Saving to LocalStorage (Size limited).");
    return base64Data;
  }
  
  try {
    // We use window.require to access Electron/Node modules in the renderer process
    // This requires nodeIntegration: true and contextIsolation: false in main.js
    const fs = (window as any).require('fs');
    const path = (window as any).require('path');
    const os = (window as any).require('os');
    
    // Path: C:\Users\<User>\AppData\Roaming\GATE Forge\assets
    // We use os.homedir() to construct the path reliably across Windows versions
    const baseDir = path.join(os.homedir(), 'AppData', 'Roaming', 'GATE Forge', 'assets');
    
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const filePath = path.join(baseDir, fileName);
    
    // Remove the Data URL header (e.g., "data:image/jpeg;base64,") to get raw bytes
    const data = base64Data.replace(/^data:.*;base64,/, "");
    
    fs.writeFileSync(filePath, data, 'base64');
    
    // Return a file:// URL so the img tag can load it
    // We replace backslashes with forward slashes for URL compatibility
    return `file://${filePath.replace(/\\/g, '/')}`;
  } catch (error) {
    console.error("Critical FS Error:", error);
    alert("Failed to save image to disk. Check permissions.");
    return base64Data; // Fallback to base64 if write fails
  }
};