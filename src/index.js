const ipcRenderer = window.ipcRenderer;

files =document.getElementById('myfile');
send =document.getElementById('send');
filesList = [];
sentList = [];
receivedList = [];
document.getElementById('nbrfilesqueu').textContent = filesList.length;
document.getElementById('myfile').addEventListener('change', handleFiles, false);
send.addEventListener('click', SendFiles, false);
function handleFiles() {
  const fileList = this.files; /* now you can work with the file list */
  for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
    const file = fileList[i];
    filesList.push(file);
  }
  document.getElementById('nbrfilesqueu').textContent = (filesList.length - sentList.length);
}
async function SendFiles() {
  const status = await window.electronAPI.sendFiles(filesList);
}
async function getdataSent() {
  const list = await window.electronAPI.FilesSent();
  document.getElementById('nbrfilessent').textContent = list.length;
  
}

window.electronAPI.recieve((filesent) => {
      //handle on download-progress event
      console.log("file sent")
      console.log(filesent)
      console.log("file sent")
      for (let i = 0, numFiles = filesent.length; i < numFiles; i++) {
        const file = filesent[i];
        sentList.push(file);
      }
      document.getElementById('nbrfilessent').textContent = sentList.length;
      document.getElementById('nbrfilesqueu').textContent = (filesList.length - 1);
      });
window.electronAPI.eventReceivedFile((dataReceived) => {
  //handle on download-progress event
  for (let i = 0, numFiles = dataReceived.length; i < numFiles; i++) {
    const file = dataReceived[i];
    receivedList.push(file);
  }
  console.log("file received")
  console.log(receivedList)
  console.log("file received")
  document.getElementById('nbrfilesReceived').textContent = receivedList.length;
  });

getdataSent();
