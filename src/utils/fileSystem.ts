export const isElectron = (): boolean => {
  return /electron/i.test(navigator.userAgent);
};

export const saveFileToDisk = (base64Data: string, fileName: string): string => {
  if (!isElectron()) {
    console.warn("Not in Electron mode. Saving to LocalStorage (Size limited).");
    return base64Data;
  }
  
  try {
    const fs = (window as any).require('fs');
    const path = (window as any).require('path');
    const os = (window as any).require('os');
    
    const baseDir = path.join(os.homedir(), 'AppData', 'Roaming', 'GATE Forge', 'assets');
    
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const filePath = path.join(baseDir, fileName);
    
    const data = base64Data.replace(/^data:.*;base64,/, "");
    
    fs.writeFileSync(filePath, data, 'base64');
    
    return `file://${filePath.replace(/\\/g, '/')}`;
  } catch (error) {
    console.error("FS Operation Failed:", error);
    return base64Data; 
  }
};
