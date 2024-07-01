<template>
  <div class="tips" v-if="!mainStore.isReady || gameStore.loading">
    <a-spin></a-spin>
    <span>{{ mainStore.tips }}</span>
  </div>
  <iframe v-if="mainStore.isReady" class="gframe" :src="iframeUrl" @load="onIframeLoaded">
  </iframe>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useControlerStore, useGameStore, useMainStore } from '@/store';
import { Message } from '@arco-design/web-vue';
import { $emit, useEventBus } from '@/hooks/useEventBus';
import { GAME_TOGGLE_PLAY, GAME_RESET, GAME_SAVE_RECORD, GAME_LOAD_RECORD, GAME_EMULATORJS_GAMEPAD, GAME_EMULATORJS_CHEAT, GAME_CHEAT_PARSE, GAME_CHEAT_DISABLE } from '@/common/symbol';
import { IGameHandler, IGameRecord } from '@/types';
import { useNes } from '@/hooks/useNes';
import { useEjs } from '@/hooks/useEjs';

const mainStore = useMainStore()
const gameStore = useGameStore()
const controlerStore = useControlerStore()// 控制器映射 pinia
const gameUrl = ref<string>(gameStore.path)
const iframeUrl = ref<string>((gameStore.isJsnes ? "JsNes" : "EmulatorJS") + ".html?rom=" + gameStore.path + "&ext=" + gameStore.ext)
let gameCoreHandler: IGameHandler | null = null;

watch(() => gameStore.lastCore, (newVal, oldVal) => {
  if (newVal) {
    gameStore.isPlaying = false;
    gameStore.loading = true;
    gameStore.saveCore()
    iframeUrl.value = (gameStore.isJsnes ? "JsNes" : "EmulatorJS") + ".html?rom=" + gameStore.path + "&ext=" + gameStore.ext
  }
})

watch(() => gameStore.path, (newVal, oldVal) => {
  if (newVal) {
    gameUrl.value = newVal
    iframeUrl.value = (gameStore.isJsnes ? "JsNes" : "EmulatorJS") + ".html?rom=" + newVal + "&ext=" + gameStore.ext
  }
})

watch(() => mainStore.volume, (newVal, oldVal) => {
  if (gameCoreHandler) {
    gameCoreHandler.setVolume(newVal)
  }
})

watch(() => controlerStore.p1, (newVal, oldVal) => {
  if (gameCoreHandler) {
    gameCoreHandler.setKeys({
      'p1': newVal,
      'p2': controlerStore.p2
    })
  }
},
  { deep: true })

watch(() => controlerStore.p2, (newVal, oldVal) => {
  if (gameCoreHandler) {
    gameCoreHandler.setKeys({
      'p1': controlerStore.p1,
      'p2': newVal
    })
  }
},
  { deep: true })

useEventBus(GAME_LOAD_RECORD, (rec: IGameRecord) => {
  if (rec && rec.data && gameCoreHandler) {
    gameCoreHandler.loadRecord(rec.data)
  }
})

useEventBus(GAME_TOGGLE_PLAY, (type: string) => {
  if (gameCoreHandler) {
    if (type) {
      if (type == "pause") {
        if (gameStore.isPlaying) {
          gameStore.isPlaying = !gameStore.isPlaying
          gameCoreHandler.pause()
        }
        Message.info("游戏已暂停")
      } else if (type == "play") {
        if (!gameStore.isPlaying) {
          gameStore.isPlaying = !gameStore.isPlaying
          gameCoreHandler.play()
        }
        Message.info("游戏已开始")
      }
    } else {
      if (gameStore.isPlaying) {
        gameCoreHandler.pause()
        Message.info("游戏已暂停")
      } else {
        gameCoreHandler.play()
        Message.info("游戏开始")
      }
      gameStore.isPlaying = !gameStore.isPlaying
    }
  }
})

useEventBus(GAME_SAVE_RECORD, () => {
  if (gameCoreHandler) {
    gameCoreHandler.saveRecord();
  }
})

useEventBus(GAME_RESET, () => {
  if (gameCoreHandler) {
    if (gameStore.isJsnes) {
      iframeUrl.value = iframeUrl.value + new Date().getTime();
    } else {
      gameCoreHandler.reset()
    }
  }
})

useEventBus(GAME_EMULATORJS_GAMEPAD, () => {
  if (gameCoreHandler) {
    gameCoreHandler.openGamepad();
  }
})


useEventBus(GAME_EMULATORJS_CHEAT, () => {
  if (gameCoreHandler) {
    gameCoreHandler.openCheat();
  }
})

useEventBus(GAME_CHEAT_PARSE, (code:string) => {
  if (gameCoreHandler) {
    gameCoreHandler.cheatParse(code);
  }
})

useEventBus(GAME_CHEAT_DISABLE, (code:string) => {
  if (gameCoreHandler) {
    gameCoreHandler.cheatDisable(code);
  }
})

const onIframeLoaded = (event: any) => {
  gameCoreHandler = gameStore.isJsnes ? useNes(event.target.contentWindow) : useEjs(event.target.contentWindow)
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
    case controlerStore.p0.ON_TOP:
      mainStore.setOnTop()
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
        case controlerStore.p0.ON_TOP:
          mainStore.setOnTop()
          break
        default:
          break
      }
    } else if (event.data.action == 'onStart') {
      gameStore.isPlaying = true;
      gameStore.loading = false;
      if (gameCoreHandler) {
        gameCoreHandler.setVolume(mainStore.volume);
        gameCoreHandler.setKeys({
          'p1': controlerStore.p1,
          'p2': controlerStore.p2
        })
      }
      mainStore.tips = "游戏加载中..."
    } else if (event.data.action == 'onTips') {
      mainStore.tips = event.data.tips
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

.tips {
  width: 100%;
  height: calc(100vh - 48px);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 1.2rem;
  background: #000;

  &>span {
    margin-left: 0.5rem;
  }
}
</style>async
