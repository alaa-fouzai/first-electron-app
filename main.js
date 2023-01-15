// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow ,Menu,ipcMain} = require('electron')
const path = require('path')
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),

        nodeIntegration: true,
        enableRemoteModule: true,
      
    }
  })
  mainWindow.loadFile('src/index.html')
  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  var menu = Menu.buildFromTemplate([
    {
        label :'Menu',
        submenu:[
            {label:'settings'},
            {type:'separator'},
            {
                label:'Exit',
                click() {
                    app.quit();
                }
            },
        ]
  },
  {
    label :'Qr Code',
    submenu:[
        {label:'new code',
        click:QRWindow
    },
        {type:'separator'},
        {
            label:'auto connect',
        }
    ]
}
])
  Menu.setApplicationMenu(menu);
}
//create qr code window
const QRWindow = () => {
    // Create the browser window.
    const QRWindow = new BrowserWindow({
      width: 300,
      height: 300,
    })
    // and load the index.html of the app.
    QRWindow.loadFile('src/pages/QR.html')
  }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

async function handleSendFiles() {
  console.log("hello again");
}