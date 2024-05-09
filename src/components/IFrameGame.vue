<template>
  <iframe class="gframe" :src="iframeUrl" @load="onIframeLoaded">
  </iframe>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useControlerStore, useGameStore, useMainStore } from '@/store';
import { Message } from '@arco-design/web-vue';
import { $emit, useEventBus } from '@/hooks/useEventBus';
import { GAME_TOGGLE_PLAY, GAME_RESET, GAME_SAVE_RECORD, GAME_LOAD_RECORD, SIDE_BAR_WIDTH } from '@/common/symbol';
import { IGameRecord } from '@/types';
import { GAME_CORE_EMULATOR_JS } from '@/utils/constant';
const iframeWindow = ref<any>(null);

const gameStore = useGameStore()
const mainStore = useMainStore()
const controlerStore = useControlerStore()// 控制器映射 pinia
const gameUrl = ref<string>(gameStore.path)
const iframeUrl = ref<string>("game.html?rom=" + gameStore.path)

watch(() => gameStore.path, (newVal, oldVal) => {
  if (newVal) {
    gameUrl.value = newVal
    iframeUrl.value = "game.html?rom=" + newVal
  }
})

useEventBus(GAME_LOAD_RECORD, (rec: IGameRecord) => {
  if (rec && rec.data) {
    game_loadRecord(stringToUint8Array(rec.data))
  }
})

useEventBus(GAME_TOGGLE_PLAY, (type: string) => {
  if (type) {
    if (type == "pause") {
      if (gameStore.isPlaying) {
        gameStore.isPlaying = !gameStore.isPlaying
        game_pause()
      }
      Message.info("游戏已暂停")
    } else if (type == "play") {
      if (!gameStore.isPlaying) {
        gameStore.isPlaying = !gameStore.isPlaying
        game_play()
      }
      Message.info("游戏已开始")
    }
  } else {
    if (gameStore.isPlaying) {
      game_pause()
      Message.info("游戏已暂停")
    } else {
      game_play()
      Message.info("游戏开始")
    }
    gameStore.isPlaying = !gameStore.isPlaying
  }
})

useEventBus(GAME_SAVE_RECORD, () => {
  game_saveRecord();
})

useEventBus(GAME_RESET, () => {
  game_reset()
})

const game_loadRecord = (rec: Uint8Array) => {
  if (iframeWindow.value) {
    iframeWindow.value.window.EJS_emulator.gameManager.loadState(rec);
    Message.success("游戏存档加载成功")
  }
}

const game_saveRecord = async () => {
  if (iframeWindow.value) {
    const state = await iframeWindow.value.window.EJS_emulator.gameManager.getState();
    const screenshot = await iframeWindow.value.window.EJS_emulator.gameManager.screenshot();
    var reader = new FileReader();
    reader.readAsDataURL(new Blob([screenshot]));
    reader.onload = function (e) {
      //@ts-ignore
      gameStore.saveRecord(Uint8ArrayToString(state), e.target?.result, GAME_CORE_EMULATOR_JS)
      Message.success("游戏存档保存成功")
    };
  }
}

const game_reset = () => {
  if (iframeWindow.value) {
    if (iframeWindow.value.window.EJS_emulator.isNetplay && iframeWindow.value.window.EJS_emulator.netplay.owner) {
      iframeWindow.value.window.EJS_emulator.gameManager.saveSaveFiles();
      iframeWindow.value.window.EJS_emulator.gameManager.restart();
      iframeWindow.value.window.EJS_emulator.netplay.reset();
      iframeWindow.value.window.EJS_emulator.netplay.sendMessage({ restart: true });
      iframeWindow.value.window.EJS_emulator.play();
    } else if (!iframeWindow.value.window.EJS_emulator.isNetplay) {
      iframeWindow.value.window.EJS_emulator.gameManager.saveSaveFiles();
      iframeWindow.value.window.EJS_emulator.gameManager.restart();
    }
  }
}


const game_play = () => {
  if (iframeWindow.value) {
    if (iframeWindow.value.window.EJS_emulator.isNetplay && iframeWindow.value.window.EJS_emulator.netplay.owner) {
      iframeWindow.value.window.EJS_emulator.play();
      iframeWindow.value.window.EJS_emulator.netplay.sendMessage({ play: true });
    } else if (!iframeWindow.value.window.EJS_emulator.isNetplay) {
      iframeWindow.value.window.EJS_emulator.play();
    }
  }
}


const game_pause = () => {
  if (iframeWindow.value) {
    if (iframeWindow.value.window.EJS_emulator.isNetplay && iframeWindow.value.window.EJS_emulator.netplay.owner) {
      iframeWindow.value.window.EJS_emulator.pause();
      iframeWindow.value.window.EJS_emulator.netplay.sendMessage({ pause: true });
    } else if (!iframeWindow.value.window.EJS_emulator.isNetplay) {
      iframeWindow.value.window.EJS_emulator.pause();
    }
  }
}

const onIframeLoaded = (event: any) => {
  iframeWindow.value = event.target.contentWindow;
}

function systemControlEvent(e: KeyboardEvent) {
  switch (e.code) {
    case controlerStore.p0.SAVE:
      $emit(GAME_SAVE_RECORD);
      break
    case controlerStore.p0.PAUSE:
      $emit(GAME_TOGGLE_PLAY);
      break
    case controlerStore.p0.RESET:
      $emit(GAME_RESET);
      break
    case controlerStore.p0.MUTE:
      mainStore.mute()
      break
    default:
      break
  }
}


onMounted(() => {
  document.addEventListener('keypress', systemControlEvent)
  // 监听消息事件
  window.addEventListener('message', function (event) {
    if (event.data.action == 'onKey') {
      switch (event.data.code) {
        case controlerStore.p0.SAVE:
          $emit(GAME_SAVE_RECORD);
          break
        case controlerStore.p0.PAUSE:
          $emit(GAME_TOGGLE_PLAY);
          break
        case controlerStore.p0.RESET:
          $emit(GAME_RESET);
          break
        case controlerStore.p0.MUTE:
          mainStore.mute()
          break
        default:
          break
      }
    } else if (event.data.action == 'onStart') {
      gameStore.isPlaying = true;
      gameStore.loading = false;
    }
  }, false);
})
onBeforeUnmount(() => {
  document.removeEventListener('keypress', systemControlEvent)
})
function Uint8ArrayToString(fileData: Uint8Array) {
  var dataString = "";
  for (var i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
  return dataString
}
function stringToUint8Array(str: string) {
  var arr = [];
  for (var i = 0, j = str.length; i < j; ++i) {
    arr.push(str.charCodeAt(i));
  }

  var tmpUint8Array = new Uint8Array(arr);
  return tmpUint8Array
}
</script>
<style lang="less" scoped>
.gframe {
  height: calc(100vh - 42px);
  width: 100%;
  background: #000;
  display: grid;
  place-items: center;
  border: 0;
}
</style>async
