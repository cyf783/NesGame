// 在主进程中.
const { ipcRenderer } = require('electron')

const setOpacity = (data) => {
  ipcRenderer.sendTo(window.senderId, "setOpacity", data);
};

const setAlwaysOnTop = (data) => {
  ipcRenderer.sendTo(window.senderId, "setAlwaysOnTop", data);
};

ipcRenderer.on("senderId", (event, data) => {
  window.senderId = event.senderId;
});

ipcRenderer.on("gamePause", (event, data) => {
  window.preload.gamePause();
});

window.preload = {
  setOpacity,
  setAlwaysOnTop,
  gamePause:()=>{}
}