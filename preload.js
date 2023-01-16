const express = require('express');
const { contextBridge,ipcRenderer, ipcMain } = require('electron')
const path = require( 'path' );
const fs = require( 'fs-extra' );
const os = require( 'os' );
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
var QRCode = require('qrcode')
const app = express();
const notification = require( '../shareFiles/src/notifications' );
const port = 5000
var downloadedFilesLocation = "/downloads";
ipaddress="";
dataToSend =[];
dataReceived =[];
dataAlreadySent =[];
prefix="file";
password="";
/***** context bridge */
contextBridge.exposeInMainWorld('electronAPI',{
  sendFiles: (e) => getFilesToSend(e),
  FilesSent: () => dataAlreadySent,
  //send: (channel, data) => ipcRenderer.send(channel, data),
  recieve: (callback) => ipcRenderer.on("filesent",(callback)),
  eventReceivedFile: (callback) => ipcRenderer.on("receivedFile",(callback)),
  ipaddress: (callback) => ipcRenderer.on("ip",(callback)),
  getQr: (callback) => ipcRenderer.on("qr",(callback))
})
/**** express fucntions */
app.use(bodyParser.json());
// enable files upload
app.use(fileUpload({
  createParentPath: true
}));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  ipaddress = getIPAddress(port);
  console.log(ipaddress);
  setTimeout(function() {
  ipcRenderer.emit("ip",ipaddress);
  ipcRenderer.emit("serverstatus",true);
},4000);

})
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
//receive files from clients
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
//send files 1 at a time
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
//get all files available for transfer
app.post('/getAllFiles', (req, res) => {
  //console.log(typeof dataToSend);
  //console.log(dataToSend);
  if (dataToSend.length > 0) {  
  res.setHeader('Content-Type', 'application/json');
  console.log(dataToSend)
  console.log(typeof dataToSend)
  files=[];
  dataToSend.forEach(item => {
    console.log(item)
    let f={};
    f.name = item.name;
    f.size = item.size;
    f.type = item.type;
    f.path = item.path;
    f.lastModified = item.lastModified;
    files.push(f);
  });
  res.end(JSON.stringify(files));
}
else {
  res.setHeader('Content-Type', 'application/json');
  res.send({"status":"success","data":"no data"});
}
})
/**** functions */

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


function getIPAddress(port) {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
        return alias.address+":"+port;
      }
        
    }
  }
  return '0.0.0.0';
}
function remouvefromqueu(element) {
  dataToSend.shift();
  dataAlreadySent.push(element);
  notification.filesAdded('File share','Success');
}
function generateQRcode(ipaddress,password) {
  QRCode.toDataURL(ipaddress+password, function (err, url) {
    console.log(url)
  })
}