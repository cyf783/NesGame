// 在主进程中.
const { ipcRenderer } = require('electron')

const setOpacity = (data) => {
  ipcRenderer.sendTo(window.senderId, "setOpacity", data);
};

const setAlwaysOnTop = (data) => {
  ipcRenderer.sendTo(window.senderId, "setAlwaysOnTop", data);
};

ipcRenderer.on("senderId", (event, data) => {
  console.log(event.senderId)
  window.senderId = event.senderId;
});

window.preload = {
  setOpacity,
  setAlwaysOnTop
}