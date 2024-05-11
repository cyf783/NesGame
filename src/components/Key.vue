<template>
  <div class="game-record">
    <div class="header" v-if="gameStore.isJsnes">
      <h3>玩家P1</h3>
    </div>
    <a-table :data="controlerStore.getP1Key" :pagination="false" v-if="gameStore.isJsnes">
      <template #columns>
        <a-table-column title="动作" data-index="action" :width="100"></a-table-column>
        <a-table-column title="键值">
          <template #cell="{ record }">
            <input :style="{ outline: 'none', padding: '10px' }"
              class="arco-input-wrapper arco-input arco-input-size-medium" :data-key="record.key" :value="record.value"
              readonly @keydown="handleKeydown" />
          </template>
        </a-table-column>
      </template>
    </a-table>
    <div class="header" v-if="gameStore.isJsnes">
      <h3>玩家P2</h3>
    </div>
    <a-table :data="controlerStore.getP2Key" :pagination="false" v-if="gameStore.isJsnes">
      <template #columns>
        <a-table-column title="动作" data-index="action" :width="100"></a-table-column>
        <a-table-column title="键值">
          <template #cell="{ record }">
            <input :style="{ outline: 'none', padding: '10px' }"
              class="arco-input-wrapper arco-input arco-input-size-medium" :data-key="record.key" :value="record.value"
              readonly @keydown="handleKeydown" />
          </template>
        </a-table-column>
      </template>
    </a-table>
    <div class="header" v-if="gameStore.isEmulatorJS">
      <a-space style="width:100%" direction="vertical">
        <a-button type="primary" status="success" long @click="handleGamepad">玩家按键配置</a-button>
        <a-button type="primary" status="warning" long @click="handleCheat">游戏秘籍配置</a-button>
      </a-space>
    </div>
    <div class="header">
      <h3>其它</h3>
    </div>
    <a-table :data="controlerStore.getP0Key" :pagination="false">
      <template #columns>
        <a-table-column title="动作" data-index="action" :width="100"></a-table-column>
        <a-table-column title="键值">
          <template #cell="{ record }">
            <input :style="{ outline: 'none', padding: '10px' }"
              class="arco-input-wrapper arco-input arco-input-size-medium" :data-key="record.key" :value="record.value"
              readonly @keydown="handleKeydown" />
          </template>
        </a-table-column>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { GAME_EMULATORJS_CHEAT, GAME_EMULATORJS_GAMEPAD } from '@/common/symbol';
import { $emit } from '@/hooks/useEventBus';
import { useControlerStore, useGameStore } from '@/store';

const controlerStore = useControlerStore()// 控制器映射 pinia
const gameStore = useGameStore()

function handleKeydown(event: any) {
  // 阻止默认行为
  event.preventDefault();
  // 阻止事件冒泡
  event.stopPropagation();
  var keyCode = event.code;
  const key = event.target.getAttribute('data-key');
  event.target.value = keyCode
  controlerStore.changeKey(key, keyCode);
}

function handleGamepad(event: any) {
  $emit(GAME_EMULATORJS_GAMEPAD);
  const closeButton = document.querySelector('.arco-drawer-close-btn');
  //@ts-ignore
  closeButton&&closeButton.click();
}

function handleCheat(event: any) {
  $emit(GAME_EMULATORJS_CHEAT);
  const closeButton = document.querySelector('.arco-drawer-close-btn');
  //@ts-ignore
  closeButton&&closeButton.click();
}

</script>

<style lang="less" scoped>
.game-record {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  :deep(.arco-list-item-action) {
    float: right;
  }
}
</style>
