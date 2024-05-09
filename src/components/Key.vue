<template>
  <div class="game-record">
    <div class="header" v-if="mainStore.isJsnes">
      <h3>玩家P1</h3>
    </div>
    <a-table :data="controlerStore.getP1Key" :pagination="false" v-if="mainStore.isJsnes">
      <template #columns>
        <a-table-column title="动作" data-index="action" :width="100"></a-table-column>
        <a-table-column title="键值">
          <template #cell="{ record }">
              <input :style="{outline:'none',padding:'10px'}" class="arco-input-wrapper arco-input arco-input-size-medium" :data-key="record.key" :value="record.value" readonly @keydown="handleKeydown"/>
          </template>
        </a-table-column>
      </template>
    </a-table>
    <div class="header" v-if="mainStore.isJsnes">
      <h3>玩家P2</h3>
    </div>
    <a-table :data="controlerStore.getP2Key" :pagination="false" v-if="mainStore.isJsnes">
      <template #columns>
        <a-table-column title="动作" data-index="action" :width="100"></a-table-column>
        <a-table-column title="键值">
          <template #cell="{ record }">
              <input :style="{outline:'none',padding:'10px'}" class="arco-input-wrapper arco-input arco-input-size-medium" :data-key="record.key" :value="record.value" readonly @keydown="handleKeydown"/>
          </template>
        </a-table-column>
      </template>
    </a-table>
    <div class="header" v-if="mainStore.isJsnes">
      <h3>其它</h3>
    </div>
    <div class="header" v-if="mainStore.isEmulatorJS">
      <h3>玩家按键请通过引擎界面提供的配置功能</h3>
    </div>
    <a-table :data="controlerStore.getP0Key" :pagination="false">
      <template #columns>
        <a-table-column title="动作" data-index="action" :width="100"></a-table-column>
        <a-table-column title="键值">
          <template #cell="{ record }">
              <input :style="{outline:'none',padding:'10px'}" class="arco-input-wrapper arco-input arco-input-size-medium" :data-key="record.key" :value="record.value" readonly @keydown="handleKeydown"/>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { useControlerStore, useMainStore } from '@/store';

const controlerStore = useControlerStore()// 控制器映射 pinia
const mainStore = useMainStore()

function handleKeydown(event:any) {
  // 阻止默认行为
  event.preventDefault();
  // 阻止事件冒泡
  event.stopPropagation();
  var keyCode = event.code;
  const key = event.target.getAttribute('data-key');
  event.target.value=keyCode
  controlerStore.changeKey(key,keyCode);
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
