<template>
  <div class="editor">
    <a-split min="220" max="0.5" v-model:size="splitSizeRef" :style="{
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

              <a-typography-text class="title">
                {{ gameStore.title }}
              </a-typography-text>
              <ATooltip mini content="重置" v-show="isElectron">
                <a-button class="menu-btn" @click="handleReset">
                  <icon-refresh />
                </a-button>
              </ATooltip>
              <ATooltip mini :content="gameStore.isPlaying ? '暂停' : '开始'" v-show="isElectron">
                <a-button class="menu-btn" @click="handleTogglePlay">
                  <icon-pause v-if="gameStore.isPlaying"/>
                  <icon-play-arrow v-else />
                </a-button>
              </ATooltip>
              <ATooltip mini content="保存进度" v-show="isElectron">
                <a-button class="menu-btn" @click="handleSaveRecord">
                  <icon-save />
                </a-button>
              </ATooltip>
              <ATooltip mini :content="gameStore.isFeature ? '移除全局关键字' : '添加文档关键字'" v-show="isElectron">
                <a-button class="menu-btn" @click="handleFeatureClick">
                  <icon-share-external v-if="gameStore.isFeature" :style="{ color: '#1a73e8' }" />
                  <icon-share-external v-else />
                </a-button>
              </ATooltip>
              <ATooltip mini content="设置" v-show="isElectron">
                <a-button class="menu-btn" @click="handleSettingsDrawer">
                  <icon-settings />
                </a-button>
              </ATooltip>
            </div>
          </a-layout-header>
          <a-layout>
            <a-layout-content>
              <nes-game v-if="mainStore.isReady"></nes-game>

              <div class="tips" v-if="!mainStore.isReady">
                <a-spin></a-spin>
                <span>模拟器加载中...</span>
              </div>
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
import { useGameStore, useMainStore, useTreeStore } from '@/store'
import SideBar from '@/components/SideBar.vue'
import Settings from '@/components/Settings.vue'
import { isElectron, removeFeature, setFeature } from '@/utils'
import { $emit, useEventBus } from '@/hooks/useEventBus';
import { GAME_TOGGLE_PLAY, GAME_RESET, GAME_SAVE_RECORD, SIDE_BAR_WIDTH, ENTER_GAME } from '@/common/symbol';
import { findNodeByKey } from '@/utils/tree';


const mainStore = useMainStore()
const gameStore = useGameStore();
const treeStore = useTreeStore();
const sideBarCollapsed = ref(false)
const splitSizeRef = ref<string | number>('220')
let lastSplitSize = splitSizeRef.value



watch(() => splitSizeRef.value, (newVal, oldVal) => {
  const s = (newVal+"").replace('px',"")
  $emit(SIDE_BAR_WIDTH, parseInt(s));
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
 * 打开设置
 */
function handleSettingsDrawer() {
  Drawer.open({
    title: '设置',
    content: () => (h(Settings)),
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

.tips {
  width: 100%;
  height: calc(100vh - 48px);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 1.2rem;

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
</style>,
