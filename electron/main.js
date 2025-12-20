/**
 * Electron Main Process
 * KoeTekt Desktop Application
 */

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Check if running in development
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
    // Create the browser window
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 800,
        minHeight: 600,
        title: 'KoeTekt',
        backgroundColor: '#050508',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        // Hide menu bar for immersion
        autoHideMenuBar: true,
    });

    // Hide the menu bar completely on Windows/Linux
    Menu.setApplicationMenu(null);

    // Load the app
    if (isDev) {
        // Development: load from Vite dev server
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // Production: load built files
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }

    // Handle window close
    mainWindow.on('closed', () => {
        app.quit();
    });
}

// App ready
app.whenReady().then(() => {
    createWindow();

    // macOS: re-create window when dock icon is clicked
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
