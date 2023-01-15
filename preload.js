const express = require('express');
const { contextBridge,ipcRenderer, ipcMain } = require('electron')
const path = require( 'path' );
const fs = require( 'fs-extra' );
const os = require( 'os' );
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const app = express();
const notification = require( '../shareFiles/src/notifications' );
const port = 5000
var downloadedFilesLocation = "/downloads";
dataToSend =[];
dataReceived =[];
dataAlreadySent =[];
prefix="file";

contextBridge.exposeInMainWorld('electronAPI',{
  sendFiles: (e) => getFilesToSend(e),
  FilesSent: () => dataAlreadySent,
  //send: (channel, data) => ipcRenderer.send(channel, data),
  recieve: (callback) => ipcRenderer.on("filesent",(callback)),
  eventReceivedFile: (callback) => ipcRenderer.on("receivedFile",(callback)),
})


function getFilesToSend(filesList) {
  //need to remouve duplicate
  for (let i = 0, numFiles = filesList.length; i < numFiles; i++) {
    const file = filesList[i];
    dataToSend.push(file);
  }
}
function FilesSent() {
  //ipcMain.send("filesent",2500);
  ipcRenderer.emit("filesent",dataAlreadySent);
  return dataAlreadySent
}
app.use(bodyParser.json());
// enable files upload
app.use(fileUpload({
  createParentPath: true
}));
app.get('/', (req, res) => {
  res.send("working");
})
app.get('/getFiles', (req, res) => {
  //console.log(typeof dataToSend);
  //console.log(dataToSend);
  if (dataToSend.length > 0) {  
  res.setHeader('Content-Type', 'application/json');
  res.download(dataToSend[0].path);
  remouvefromqueu(dataToSend[0]);
  FilesSent();
}
else {
  res.sendStatus(404);
}

  //res.end(JSON.stringify({ a:dataToSend }, null, 3));

})
app.post('/uploadFile', async (req, res) => {
  try {
      if(!req.files) {
          res.send({
              status: false,
              message: 'No file uploaded'
          });
      } else {
        //console.log("files upload");
        //console.log(typeof req.files);
        let files=req.files;
        let keys=Object.keys(files);
        //console.log(keys)
        keys.forEach(item => {
          //console.log(files[item])
          //files[item].mv('.'+downloadedFilesLocation+'/' + avatar.name);
          uploadPath = __dirname + downloadedFilesLocation+'/' + files[item].name;
          dataReceived.push(files[item]);
          files[item].mv(uploadPath, function(err) {
            if (err)
              console.log(err);
        
          });
        })
        //console.log(dataReceived);
        ipcRenderer.emit("receivedFile",dataReceived);
        notification.filesAdded('File received','Success');
        res.sendStatus(200);
      }
  } catch (err) {
      res.status(500).send(err);
  }
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(getIPAddress());
  contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    testlate: async() => {
        await delay(10000)
        return "true";
    },
    // we can also expose variables, not just functions
    ipaddress:getIPAddress(),
    ping: () => ipcRenderer.invoke('ping'),
  })
})
function getIPAddress() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.cidr;
    }
  }
  return '0.0.0.0';
}
function remouvefromqueu(element) {
  dataToSend.shift();
  dataAlreadySent.push(element);
  notification.filesAdded('File share','Success');
}
app.post('/postFiles', (req, res) => {
  //console.log(typeof dataToSend);
  //console.log(dataToSend);
  if (dataToSend.length > 0) {  
  res.setHeader('Content-Type', 'application/json');
  res.download(dataToSend[0].path);
  remouvefromqueu(dataToSend[0]);
  FilesSent();
}
else {
  res.sendStatus(404);
}
})