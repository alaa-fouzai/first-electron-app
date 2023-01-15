const { contextBridge,ipcRenderer } = require( 'electron' );

// display files added notification
exports.filesAdded = ( title,message ) => {
    const NOTIFICATION_TITLE = title
    const NOTIFICATION_BODY = message
    const CLICK_MESSAGE = 'File Sent!'

    new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY })
    .onclick = () => document.getElementById("output").innerText = CLICK_MESSAGE
};
exports.sendNotif = ( title,message ) => {
    const NOTIFICATION_TITLE = title
    const NOTIFICATION_BODY = message
    const CLICK_MESSAGE = 'File Sent!'

    new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY })
    .onclick = () => document.getElementById("output").innerText = CLICK_MESSAGE
};