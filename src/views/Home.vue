<template>
  <div class="editor">
    <div class="home-tips" v-if="!mainStore.isDetach">
      <span>注:需要先点击右上角选择分离为独立窗口(或者按ctr1+d)后再进行游戏</span>
    </div>
    <a-split v-if="mainStore.isDetach" min="220" max="0.5" v-model:size="splitSizeRef" :style="{
      height: '100vh',
      width: '100%',
    }">
      <template #first>
        <SideBar></SideBar>
      </template>
      <template #second>
        <a-layout>
          <a-layout-header>
            <div class="header">
              <ATooltip mini :content="sideBarCollapsed ? '显示左侧菜单' : '隐藏左侧菜单'">
                <a-button class="menu-btn" @click="handleSideBarCollapse">
                  <icon-menu-unfold v-if="sideBarCollapsed" />
                  <icon-menu-fold v-else />
                </a-button>
              </ATooltip>

              <a-typography-text class="title text-ellipsis" :title="gameStore.title">
                {{ gameStore.title }}
              </a-typography-text>
              <ATooltip mini :content="'重置<' + controlerStore.getResetKey + '>'" v-show="isElectron">
                <a-button class="menu-btn top-action" @click="handleReset">
                  <icon-refresh />
                </a-button>
              </ATooltip>
              <ATooltip mini
                :content="gameStore.isPlaying ? '暂停<' + controlerStore.getPauseKey + '>' : '开始<' + controlerStore.getPauseKey + '>'"
                v-show="isElectron">
                <a-button class="menu-btn top-action" @click="handleTogglePlay">
                  <icon-pause v-if="gameStore.isPlaying" />
                  <icon-play-arrow v-else />
                </a-button>
              </ATooltip>
              <ATooltip mini :content="'保存进度<' + controlerStore.getSaveKey + '>'" v-show="isElectron">
                <a-button class="menu-btn top-action" @click="handleSaveRecord">
                  <icon-save />
                </a-button>
              </ATooltip>

              <a-trigger trigger="hover" show-arrow :popup-translate="[0, 10]">
                <a-button class="menu-btn top-action" @click="handleMute"
                  :title="'静音<' + controlerStore.getVolumeKey + '>'">
                  <icon-mute v-if="mainStore.volume == 0" />
                  <icon-sound v-else />
                </a-button>
                <template #content>
                  <div class="demo-arrow">
                    <a-slider :style="{ width: '100%' }" v-model="mainStore.volume" :format-tooltip="volumeformatter"
                      @change="mainStore.saveGain" />
                  </div>
                </template>
              </a-trigger>
              <a-trigger trigger="hover" show-arrow :popup-translate="[0, 10]">
                <a-button class="menu-btn top-action" title="透明度">
                  <icon-eye-invisible v-if="mainStore.transparent == 0" />
                  <icon-eye v-else />
                </a-button>
                <template #content>
                  <div class="demo-arrow">
                    <a-slider v-model="mainStore.transparent" :min='5' :style="{ width: '100%' }"
                      :format-tooltip="transparentFormatter" @change="mainStore.saveTransparent" />
                  </div>
                </template>
              </a-trigger>
              <ATooltip mini :content="(mainStore.alwaysOnTop ? '取消置顶' : '置顶' + '<' + controlerStore.getOnTopKey + '>')"
                v-show="isElectron">
                <a-button class="menu-btn top-action" @click="handleOnTop" :class="mainStore.alwaysOnTop ? 'on-top' : null">
                  <icon-to-top />
                </a-button>
              </ATooltip>
              <ATooltip mini :content="'配置'" v-show="isElectron">
                <a-button class="menu-btn top-action" @click="handleKey">
                  <icon-robot />
                </a-button>
              </ATooltip>
              <ATooltip mini content="存档" v-show="isElectron">
                <a-button class="menu-btn top-action" @click="handleRecordDrawer">
                  <icon-history />
                </a-button>
              </ATooltip>
              <ATooltip mini content="切换引擎" v-show="isElectron" v-if="gameStore.isNes">
                <a-radio-group type="button" size="large" v-model="gameStore.core" class="core-type">
                  <a-radio value="JSNES">JSNES</a-radio>
                  <a-radio value="EmulatorJS">EmulatorJS</a-radio>
                </a-radio-group>
              </ATooltip>
            </div>
          </a-layout-header>
          <a-layout>
            <a-layout-content>
              <Game />
            </a-layout-content>
          </a-layout>
        </a-layout>
      </template>
    </a-split>
  </div>
</template>

<script setup lang="ts">
import { Drawer } from '@arco-design/web-vue';
import { IconMenuFold, IconMenuUnfold } from '@arco-design/web-vue/es/icon'
import { useControlerStore, useGameStore, useMainStore } from '@/store'
import { isElectron } from '@/utils'
import { $emit } from '@/hooks/useEventBus';
import { GAME_TOGGLE_PLAY, GAME_RESET, GAME_SAVE_RECORD, SIDE_BAR_WIDTH } from '@/common/symbol';
import SideBar from '@/components/SideBar.vue'
import Record from '@/components/Record.vue'
import Setting from '@/components/Setting.vue';
import Game from '@/components/Game.vue';
import { setAlwaysOnTop, setOpacity } from '@/preload';

const mainStore = useMainStore()
const gameStore = useGameStore();
const controlerStore = useControlerStore()// 控制器映射 pinia
const sideBarCollapsed = ref(false)
const splitSizeRef = ref<string | number>('220')
let lastSplitSize = splitSizeRef.value

watch(() => splitSizeRef.value, (newVal, oldVal) => {
  const s = (newVal + "").replace('px', "")
  $emit(SIDE_BAR_WIDTH, parseInt(s));
})

watch(() => mainStore.transparent, (newVal, oldVal) => {
  setOpacity(newVal / 100)
})

watch(() => mainStore.alwaysOnTop, (newVal, oldVal) => {
  setAlwaysOnTop(newVal)
})

// 卸载时更新状态库
onUnmounted(() => {
})

function volumeformatter(value: number) {
  return `音量${value}%`
};

function transparentFormatter(value: number) {
  return `透明度${value}%`
};

/**
 * 侧边栏折叠状态变化时触发
 */
function handleSideBarCollapse() {
  sideBarCollapsed.value = !sideBarCollapsed.value
  if (sideBarCollapsed.value) {
    lastSplitSize = splitSizeRef.value
    splitSizeRef.value = 0
  } else {
    splitSizeRef.value = lastSplitSize
  }
}
/**
 * 打开存档
 */
function handleRecordDrawer() {
  Drawer.open({
    title: `存档【${gameStore.title}】`,
    content: () => (h(Record)),
    width: 340,
    footer: false
  });
}
function handleReset() {
  $emit(GAME_RESET);
}
function handleTogglePlay() {
  $emit(GAME_TOGGLE_PLAY);
}
function handleSaveRecord() {
  $emit(GAME_SAVE_RECORD);
}
function handleMute() {
  mainStore.mute();
}
function handleOnTop() {
  mainStore.setOnTop();
}

function handleKey() {
  Drawer.open({
    title: `配置`,
    content: () => (h(Setting)),
    width: 340,
    footer: false
  });
}

onMounted(() => {
  mainStore.init()
});

</script>

<style lang="less" scoped>
.on-top {
  color: var(--primary-color);
}

.demo-arrow {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  padding: 10px;
  width: 200px;
  background-color: var(--color-bg-popup);
  border-radius: 4px;
}

.editor {
  border-top: 1px solid var(--line-color);
  height: 100%;

  .arco-layout,
  .a-layout {
    overflow: hidden;
  }

  :deep(.arco-split-pane.arco-split-pane-second) {
    overflow: hidden;
  }
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  .title {
    width: 100%;
    height: 3em;
    line-height: 3em;
    background-color: var(--c-bg-color);

    :deep(.arco-input) {
      font-size: 1.2rem;
      font-weight: 500;
    }
  }

  .menu-btn {
    height: 3em;
    border-radius: 0;

    .arco-icon {
      zoom: 1.2;
    }

    background-color: var(--c-bg-color);
  }

  .dropdown-btn {
    height: 3em;
    border-radius: 0;

    .arco-icon {
      zoom: 1.2;
    }

    background-color: var(--c-bg-color);
  }
}

.home-tips {
  width: 100%;
  height: 100vh;
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

.viewer-container {
  height: calc(100vh - 44px); // 减去标题栏的高度
  background-color: var(--c-bg-color);
  border-top: 1px solid var(--line-color);
  overflow: hidden;
  padding: 0 0 0 20px;
}

.core-type {
  background-color: var(--c-bg-color);

  .arco-radio-button {
    :deep(.arco-radio-button-content) {
      line-height: 36px;
      font-size: 10px;
      padding: 0 5px;
    }
  }
}

.text-ellipsis {
  white-space: nowrap;
  /* 确保文本在一行内显示 */
  overflow: hidden;
  /* 超出容器部分隐藏 */
  text-overflow: ellipsis;
  /* 使用省略号表示文本超出 */
}

.top-action {
  padding: 0 10px;
}
</style>,
