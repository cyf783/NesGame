// 在主进程中.
const { ipcRenderer } = require('electron')

let ubWindow = null

// Load a remote URL
window.exports = {
  "mainGame": { // 注意：键对应的是 plugin.json 中的 features.code
    mode: "none",  // 用于无需 UI 显示，执行一些简单的代码
    args: {
      // 进入插件应用时调用
      enter: (action) => {
        window.utools.hideMainWindow()
        try {
          if(ubWindow.isVisible()){
            ipcRenderer.sendTo(ubWindow.webContents.id, "gamePause")
            ubWindow.hide();
          }else{
            ubWindow.show();
          }
          window.utools.outPlugin()
        } catch (error) {
          let url = "./index.html"
          if (utools.isDev()) {
            url = "../dist/index.html"
          }
          ubWindow = utools.createBrowserWindow(url,
            {
              title: utools.getAppName(),
              width: 1000,
              height: 600,
              titleBarOverlay: true,
              webPreferences: {
                devTools: utools.isDev(),
                transparent: true,
                preload: "pld.js",
              },
            },
            () => {
              ubWindow.show();
              ipcRenderer.sendTo(ubWindow.webContents.id, "senderId")
              window.utools.outPlugin()
            }
          );
        }
      }
    }
  }
}

ipcRenderer.on("setOpacity", (event, data) => {
  ubWindow.setOpacity(data)
});

ipcRenderer.on("setAlwaysOnTop", (event, data) => {
  ubWindow.setAlwaysOnTop(data, 'pop-up-menu');
});