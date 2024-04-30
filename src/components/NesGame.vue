<template>
  <div class="game-main">
    <NesVue ref="nes" :url="gameUrl" label="开始游戏" :width="screenSize.width" :height="screenSize.height" class="game-nes"
      :p1="controlerStore.p1" :p2="controlerStore.p2" :gain="mainStore.volume" :auto-start="true" @error="onError"
      @success="onSuccess" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { EmitErrorObj, NesVue } from 'nes-vue';
import { useInstance } from '@/utils';
import { useControlerStore, useGameStore, useMainStore } from '@/store';
import { Message } from '@arco-design/web-vue';
import { $emit, useEventBus } from '@/hooks/useEventBus';
import { GAME_TOGGLE_PLAY, GAME_RESET, GAME_SAVE_RECORD, GAME_LOAD_RECORD, SIDE_BAR_WIDTH, GAME_STOP } from '@/common/symbol';

const gameStore = useGameStore()
const mainStore = useMainStore()
const controlerStore = useControlerStore()// 控制器映射 pinia
const nes = useInstance<typeof NesVue>()
const gameUrl = ref<string>(gameStore.path)
const sideBarWidth = ref(220)

const screenSize = reactive({
  width: '512px',
  height: '480px',
})

watch(() => gameStore.path, (newVal, oldVal) => {
  if (newVal) {
    gameUrl.value = newVal
  }
})

useEventBus(GAME_LOAD_RECORD, (id: string) => {
  const rec = gameStore.loadRecord(id);
  if (rec) {
    nes.value.loadGameData(JSON.parse(rec.data))
    Message.success("游戏存档加载成功")
  }
})

useEventBus(SIDE_BAR_WIDTH, (width: number) => {
  sideBarWidth.value = width;
  initScreenSize()
})

useEventBus(GAME_STOP, (type: string) => {
  nes.value.stop()
})

useEventBus(GAME_TOGGLE_PLAY, (type: string) => {
  if (type) {
    if (type == "pause") {
      if (gameStore.isPlaying) {
        nes.value.pause()
        gameStore.isPlaying = !gameStore.isPlaying
      }
      Message.info("游戏已暂停")
    } else if (type == "play") {
      if (!gameStore.isPlaying) {
        nes.value.play()
        gameStore.isPlaying = !gameStore.isPlaying
      }
      Message.info("游戏已开始")
    }
  } else {
    if (gameStore.isPlaying) {
      nes.value.pause()
      Message.info("游戏已暂停")
    } else {
      nes.value.play()
      Message.info("游戏开始")
    }
    gameStore.isPlaying = !gameStore.isPlaying
  }
})

useEventBus(GAME_SAVE_RECORD, () => {
  const saveImage = nes.value.screenshot() as HTMLImageElement
  saveImage.onload = () => {
    const cvs = document.createElement('canvas')
    cvs.width = 48
    cvs.height = 45
    const ctx = cvs.getContext('2d')
    if (ctx) {
      ctx.drawImage(saveImage, 0, 0, cvs.width, cvs.height)
      gameStore.saveRecord(JSON.stringify(nes.value.getGameData()), cvs.toDataURL('image/png'))
      Message.success("游戏存档保存成功")
    }
  }
})

useEventBus(GAME_RESET, () => {
  nes.value.reset()
})

function onSuccess() {
  gameStore.isPlaying = true;
  gameStore.loading = false;
}


function onError(error: EmitErrorObj) {
  console.error(error.message)
  Message.error(error.message);
  gameStore.loading = false;
}

function cheatCode() {
  nes.value.cheatCode('079F-01-01')
}

function disableCheatCode() {
  nes.value.cancelCheatCode('079F-01-01')
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
  window.addEventListener('resize', initScreenSize)
  document.addEventListener('keypress', systemControlEvent)
  initScreenSize()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', initScreenSize)
  document.removeEventListener('keypress', systemControlEvent)
})
// 初始化游戏画面大小
function initScreenSize() {
  const { clientWidth } = document.documentElement
  const { innerHeight } = window
  let width = clientWidth * 1 - sideBarWidth.value
  let height = width * 240 / 256
  if (height > innerHeight * 1 - 42) {
    height = innerHeight * 1 - 42
    width = (height * 256 / 240)
  }
  screenSize.width = width + 'px'
  screenSize.height = height + 'px'
}
</script>
<style lang="less" scoped>
.game-main {
  height: calc(100vh - 42px);
  width: 100%;
  background: #000;
  display: grid;
  place-items: center;
  /* 水平和垂直居中 */
}
</style>
