<template>
  <iframe class="gframe" :src="iframeUrl" @load="onIframeLoaded">
  </iframe>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useControlerStore, useGameStore, useMainStore } from '@/store';
import { Message } from '@arco-design/web-vue';
import { $emit, useEventBus } from '@/hooks/useEventBus';
import { GAME_TOGGLE_PLAY, GAME_RESET, GAME_SAVE_RECORD, GAME_LOAD_RECORD, SIDE_BAR_WIDTH, GAME_EMULATORJS_GAMEPAD, GAME_EMULATORJS_CHEAT } from '@/common/symbol';
import { IGameRecord } from '@/types';
import { GAME_CORE_EMULATOR_JS, GAME_CORE_JSNES } from '@/utils/constant';
import { stringToUint8Array, uint8ArrayToString } from '@/utils';
const iframeWindow = ref<any>(null);

const mainStore = useMainStore()
const gameStore = useGameStore()
const controlerStore = useControlerStore()// 控制器映射 pinia
const gameUrl = ref<string>(gameStore.path)
const iframeUrl = ref<string>("JsNes.html?rom=" + gameStore.path + "&ext=" + gameStore.ext)

watch(() => gameStore.path, (newVal, oldVal) => {
  if (newVal) {
    gameUrl.value = newVal
    iframeUrl.value = "JsNes.html?rom=" + newVal + "&ext=" + gameStore.ext
  }
})

watch(() => mainStore.volume, (newVal, oldVal) => {
  game_setVolume(newVal)
})

watch(() => controlerStore.p1, (newVal, oldVal) => {
  game_setKeys({
    'p1': newVal,
    'p2': controlerStore.p2
  })
},
  { deep: true })

watch(() => controlerStore.p2, (newVal, oldVal) => {
  game_setKeys({
    'p1': controlerStore.p1,
    'p2': newVal
  })
},
  { deep: true })

useEventBus(GAME_LOAD_RECORD, (rec: IGameRecord) => {
  if (rec && rec.data) {
    game_loadRecord(JSON.parse(uint8ArrayToString(rec.data)))
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

const game_loadRecord = (rec: any) => {
  if (iframeWindow.value) {
    iframeWindow.value.window.JSNES.loadNesData(rec);
    Message.success("游戏存档加载成功")
  }
}

const game_saveRecord = async () => {
  if (iframeWindow.value) {
    const data = await iframeWindow.value.window.JSNES.getNesData();
    const screenshot = await iframeWindow.value.window.JSNES.getNesImg();
    gameStore.saveRecord(stringToUint8Array(JSON.stringify(data)), screenshot, GAME_CORE_JSNES)
    Message.success("游戏存档保存成功")
  }
}

const game_setKeys = (keys: any) => {
  if (iframeWindow.value) {
    iframeWindow.value.window.JSNES.setKeys(keys);
  }
}

const game_reset = () => {
  if (iframeWindow.value) {
    iframeWindow.value.window.JSNES.reset();
  }
}


const game_play = () => {
  if (iframeWindow.value) {
    iframeWindow.value.window.JSNES.play();
  }
}


const game_pause = () => {
  if (iframeWindow.value) {
    iframeWindow.value.window.JSNES.pause();
  }
}

const game_setVolume = (num: number) => {
  if (iframeWindow.value) {
    iframeWindow.value.window.JSNES.setVolume(num);
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
      game_setVolume(mainStore.volume)
      game_setKeys({
        'p1': controlerStore.p1,
        'p2': controlerStore.p2
      })
    }
  }, false);
})
onBeforeUnmount(() => {
  document.removeEventListener('keypress', systemControlEvent)
})
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
