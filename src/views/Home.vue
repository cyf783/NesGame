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
                <ATooltip mini :content="'音量<' + controlerStore.getVolumeKey + '>'" v-show="isElectron">
                  <a-button class="menu-btn top-action" @click="handleMute">
                    <icon-mute v-if="mainStore.volume == 0" />
                    <icon-sound v-else />
                  </a-button>
                </ATooltip>
                <template #content>
                  <div class="demo-arrow">
                    <a-slider :style="{ width: '100%' }" v-model="mainStore.volume" @change="mainStore.saveGain" />
                  </div>
                </template>
              </a-trigger>
              <ATooltip mini :content="'配置'" v-show="isElectron">
                <a-button class="menu-btn top-action" @click="handleKey">
                  <icon-robot />
                </a-button>
              </ATooltip>
              <ATooltip mini :content="gameStore.isFeature ? '移除全局关键字' : '添加游戏关键字'" v-show="isElectron">
                <a-button class="menu-btn top-action" @click="handleFeatureClick">
                  <icon-share-external v-if="gameStore.isFeature" :style="{ color: '#1a73e8' }" />
                  <icon-share-external v-else />
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
              <div class="tips" v-if="!mainStore.isReady || gameStore.loading">
                <a-spin></a-spin>
                <span>{{ mainStore.tips }}</span>
              </div>
              <NESGame v-if="mainStore.isReady && gameStore.isJsnes"></NESGame>
              <EJSGame v-if="mainStore.isReady && gameStore.isEmulatorJS"></EJSGame>
            </a-layout-content>
          </a-layout>
        </a-layout>
      </template>
    </a-split>
  </div>
</template>

<script setup lang="ts">
import { Drawer, Message } from '@arco-design/web-vue';
import { IconMenuFold, IconMenuUnfold } from '@arco-design/web-vue/es/icon'
import { useControlerStore, useGameStore, useMainStore, useTreeStore } from '@/store'
import SideBar from '@/components/SideBar.vue'
import Record from '@/components/Record.vue'
import { isElectron, removeFeature, setFeature } from '@/utils'
import { $emit, useEventBus } from '@/hooks/useEventBus';
import { GAME_TOGGLE_PLAY, GAME_RESET, GAME_SAVE_RECORD, SIDE_BAR_WIDTH, ENTER_GAME } from '@/common/symbol';
import { findNodeByKey } from '@/utils/tree';
import Setting from '@/components/Setting.vue';


const mainStore = useMainStore()
const gameStore = useGameStore();
const treeStore = useTreeStore();
const controlerStore = useControlerStore()// 控制器映射 pinia
const sideBarCollapsed = ref(false)
const splitSizeRef = ref<string | number>('220')
let lastSplitSize = splitSizeRef.value

watch(() => splitSizeRef.value, (newVal, oldVal) => {
  const s = (newVal + "").replace('px', "")
  $emit(SIDE_BAR_WIDTH, parseInt(s));
})

watch(() => gameStore.lastCore, (newVal, oldVal) => {
  if (newVal) {
    gameStore.isPlaying = false;
    gameStore.loading = true;
    gameStore.saveCore()
  }
})

// 卸载时更新状态库
onUnmounted(() => {
})

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

function handleKey() {
  Drawer.open({
    title: `配置`,
    content: () => (h(Setting)),
    width: 340,
    footer: false
  });
}

onMounted(() => {
  init()
});

function init() {
  // 通过全局关键字进入插件
  useEventBus(ENTER_GAME, (key: string) => {
    const node = findNodeByKey(key, treeStore.data)
    if (!node) {
      // 处理边界情况
      removeFeature(`game/${key}`)
      Message.error('未找到对应游戏')
      return
    }
    treeStore.selected = node
  })
  mainStore.init()
}

function handleFeatureClick() {
  if (gameStore.isFeature) {
    gameStore.isFeature = false;
    removeFeature(gameStore.featureKey);
    Message.success("全局关键字已移除");
  } else {
    gameStore.isFeature = true;
    setFeature({
      code: gameStore.featureKey,
      explain: "打开我的游戏",
      platform: ["darwin", "win32", "linux"],
      icon: "logo.png",
      cmds: [gameStore.title],
    });
    Message.success("全局关键字已添加");
  }
}

</script>

<style lang="less" scoped>
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
  white-space: nowrap; /* 确保文本在一行内显示 */
  overflow: hidden; /* 超出容器部分隐藏 */
  text-overflow: ellipsis; /* 使用省略号表示文本超出 */
}
.top-action{
  padding: 0 10px;
}
</style>,
