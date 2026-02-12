
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "GATE Forge",
    backgroundColor: '#0a0a0a', // Matches the app's bg-gate-950
    icon: path.join(__dirname, 'public', 'favicon.ico'), // Assumes a favicon exists
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Simplified security model for local offline app
      webSecurity: false // Allows loading local resources (images) easily
    },
    autoHideMenuBar: true, // Hides the default File/Edit menu for a cleaner look
  });

  // Load the index.html from the build folder
  // logic: In production/exe, we load the built file. 
  // Ensure you run 'npm run build' before running this.
  win.loadFile(path.join(__dirname, 'build', 'index.html'));

  // Open external links (like Gmail) in the default browser, not inside the Electron window
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:') || url.startsWith('mailto:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

// Electron lifecycle methods
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
