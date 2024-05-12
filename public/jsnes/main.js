
const tips = document.getElementById("tips");
const cvs = document.getElementById("cvs");
const ctx = cvs.getContext("2d");
ctx.width = "256";
ctx.height = "240";
let fpsInterval = 0;
let romBuffer = null;

const nes = new jsnes.NES({
  onFrame,
  onAudioSample,
  sampleRate: getSampleRate(),
});

addKeyboardEvent(nes);

// 触发错误消息
function emitError(message) {
  window.parent.postMessage({ action: "onStart" }, "*");
  tips.innerHTML = message;
  tips.style.display = "flex";
}

function toggleSolution() {
  setTimeout(() => {
    fitInParent(cvs);
  }, 50);
}

window.JSNES = {};

window.JSNES.pause = (v) => {
  pause();
};
window.JSNES.play = (v) => {
  play();
};

window.JSNES.setVolume = (v) => {
  setGain(v);
};

// 游戏停止
let isStop = true;
const stop = () => {
  if (isStop) {
    return;
  }
  audioStop();
  animationStop();
  clearInterval(fpsInterval);
  nes.reset();
  isStop = true;
};

// 游戏重置
window.JSNES.reset = () => {
  if (!romBuffer) {
    return;
  }
  if (!isStop) {
    stop();
  }
  start();
};

// 游戏重置
window.JSNES.setKeys = (keys) => {
  setKeys(keys);
};

window.JSNES.getNesData = () => {
  const ppuData = nes.ppu.toJSON();
  const cpuData = nes.cpu.toJSON();
  delete ppuData.attrib;
  delete ppuData.bgbuffer;
  delete ppuData.buffer;
  delete ppuData.pixrendered;
  delete ppuData.vramMirrorTable;
  const vramMenZip = compressArray(ppuData.vramMem);
  const nameTableZip = compressNameTable(ppuData.nameTable);
  const ptTileZip = compressPtTile(ppuData.ptTile);
  const cpuMemZip = compressArray(cpuData.mem);
  delete ppuData.vramMem;
  delete ppuData.nameTable;
  delete cpuData.mem;
  delete ppuData.ptTile;
  return {
    cpu: cpuData,
    mmap: nes.mmap.toJSON(),
    ppu: ppuData,
    vramMenZip,
    nameTableZip,
    cpuMemZip,
    ptTileZip,
  };
};

window.JSNES.getNesImg = () => {
  return new Promise((resolve) => {
    if (cvs) {
      const img = new Image();
      img.src = cvs.toDataURL("image/png");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 48;
        canvas.height = 45;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 48, 45);
        resolve(canvas.toDataURL("image/png"));
      };
    } else {
      resolve(null);
    }
  });
};

// 读取游戏
window.JSNES.loadNesData = (saveData) => {
  try {
    nes.ppu.reset();
    const ppuData = saveData.ppu;
    const cpuData = saveData.cpu;
    ppuData.attrib = get_fill_arr(0x20, 0);
    ppuData.bgbuffer = get_fill_arr(0xf000, 0);
    ppuData.buffer = get_fill_arr(0xf000, 0);
    ppuData.pixrendered = get_fill_arr(0xf000, 0);
    ppuData.vramMem = decompressArray(saveData.vramMenZip);
    ppuData.nameTable = decompressNameTable(saveData.nameTableZip);
    ppuData.vramMirrorTable = getVramMirrorTable();
    ppuData.ptTile = decompressPtTile(saveData.ptTileZip);
    cpuData.mem = decompressArray(saveData.cpuMemZip);
    nes.ppu.reset();
    nes.romData = romBuffer;
    nes.cpu.fromJSON(cpuData);
    nes.mmap.fromJSON(saveData.mmap);
    nes.ppu.fromJSON(ppuData);
  } catch (e) {
    return emitError("读取失败，数据丢失或无效。");
  }
};

// 开始
const start = () => {
  nes.ppu.clipToTvSize = true
  try {
    nes.loadROM(romBuffer);
  } catch (e) {
    emitError("读取失败，模拟器不支持该游戏ROM。");
    return;
  }
  fitInParent(cvs);
  audioFrame(nes);
  animationFram(cvs);
  isStop = false;
  isPause = false;

  window.parent.postMessage({ action: "onStart" }, "*");
  // 监听键盘事件
  document.addEventListener("keydown", function (event) {
    // 发送按键消息到父窗口
    window.parent.postMessage({ action: "onKey", code: event.code }, "*");
  });
};

// 加载ROM
function loadROM() {
  const url = getRom();
  if (!isStop) {
    stop();
  }
  if (romBuffer) {
    start();
    return;
  }
  const req = new XMLHttpRequest();
  req.addEventListener('progress', (e) => {
      const progress = e.total ? ' '+Math.floor(e.loaded / e.total * 100).toString()+'%' : ' '+(e.loaded/1048576).toFixed(2)+'MB';
      window.parent.postMessage({ action: "onTips",tips:"下载游戏"+progress }, "*");
  });
  req.open("GET", url);
  req.overrideMimeType("text/plain; charset=x-user-defined");
  req.timeout = 300000;
  req.ontimeout = () => {
    emitError(
      `${title.textContent}请求超时，可能是地址失效或网络不稳定。`
    );
  };
  req.onerror = () => {
    emitError(
      `${title.textContent}加载失败，可能是地址失效或网络不稳定。`
    );
  };
  req.onload = function () {
    if (this.status === 200) {
      romBuffer = this.responseText;
      start();
    } else {
      emitError(`${title.textContent}加载失败，地址可能已经失效。`);
    }
  };
  req.send();
}

window.onload = () => {
  const gm = new GamepadManager();
  gm.frame();
  loadROM();

  window.addEventListener("resize", toggleSolution);
  toggleSolution();
};
function getRom() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("rom");
}