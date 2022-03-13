const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const { dialog } = require('electron');
const fs = require('fs');
const imghash = require("imghash");
//const leven = import("leven");

let Files  = [];

// Note: Must match `build.appId` in package.json.
app.setAppUserModelId('com.company.AppName');

// Electron Reloader
try {
  require('electron-reloader')(module);
} catch { }

let mainWindow;
// Create Window.
const createMainWindow = async () => {
  const win = new BrowserWindow({
    title: app.name,
    show: false,
    width: 300,
    height: 400,
    // opacity: 0.7,  Add Opacity to app.
    icon: __dirname + './build/icon.png',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // Protect against prototype pollution.
      enableRemoteModule: false, // Turn off Remote
      preload: path.join(app.getAppPath(), './app/preload.js'),
    },
  });
  win.on('ready-to-show', () => {
    win.show();
  });
  win.on('closed', () => {
    // Dereference the window.
    // For multiple windows store them in an array.
    mainWindow = undefined;
  });

  // Optional:

  win.removeMenu(); // Remove menu.
  // win.webContents.openDevTools(); // Open DevTools.

  await win.loadFile(path.join(__dirname, 'app/index.html'));
  return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
  }
});

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', async () => {
  if (!mainWindow) {
    mainWindow = await createMainWindow();
  }
});

(async () => {
  await app.whenReady();
  mainWindow = await createMainWindow();
})();

/***********************************
 * Create a New Album
 ***********************************/

ipcMain.on('newAlbum', function() {

  // Show Folder select dialog
  let albumTopDirectory = dialog.showOpenDialogSync({ properties: ['openDirectory'] });

  // Start load screen
  mainWindow.webContents.send("loadingScreen");

  // Get directory List
  let albumTable = [];

  recursiveListDirectory(albumTopDirectory);

  // List all files recursively 
  const validExtensions = [".jpg", ".jpeg", ".jfif", ".png"];
  Files.forEach(function (file) {
    if (validExtensions.some(w => file.substring(file.lastIndexOf('/') + 1).includes(w))) {
      let tableEntry = {filename: file, hash: '', tags: []};
      albumTable.push(tableEntry);
    }else{
      if (file.substring(file.lastIndexOf('/') + 1) == 'phos.json') {
        /**************** TODO: There's already a phos.json file. Tell the user. ***********************/
      }
    }    
  });

  // Hash images
  albumTable.forEach(function (entry) {
    // hash this image
    let thisHash = imghash.hash(entry.filename, 16);
    // retrieve the current hashList
    let hashTable = albumTable.map(({ hash }) => hash);
    // check the hashlist to see if this image is identical to another in the album
    if (hashTable.includes(thisHash)){
      /**************** TODO: This image is identical to another. Tell the user. ***********************/
    }else{
      entry.hash = thisHash;
    }
  });

  // Create phos.json
  // Serialize the albumTable object with human readable formatting
  let tableData = JSON.stringify(albumTable, null, 2);
  // Create phos.json and write JSON
  fs.writeFileSync('phos.json', tableData);

  // Open Gallery View
  launchAlbum(albumTopDirectory);

});

/***********************************
 * Load an Album Table and Open the Gallery View
 ***********************************/

function launchAlbum(albumTablePath) 
{

  // Get find the phos.json file and load it
  // + '\\phos.json'

}

ipcMain.on('resizeWindow', function(event, args) {
  mainWindow.setSize(args[0], args[1]);
});

// s/o Smally 
// https://stackoverflow.com/questions/41462606/get-all-files-recursively-in-directories-nodejs
function recursiveListDirectory(Directory) {
    fs.readdirSync(Directory).forEach(File => {
    const Absolute = path.join(Directory, File);
    if (fs.statSync(Absolute).isDirectory()) return recursiveListDirectory(Absolute);
    else return Files.push(Absolute);
    });
}