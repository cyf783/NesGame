<template>
  <div class="game-record">
    <div class="header" v-if="gameStore.isJsnes">
      <h3>金手指</h3>
    </div>
    <a-table :data="gameStore.cheats" :pagination="false" v-if="gameStore.isJsnes">
      <template #columns>
        <a-table-column :width="62" title="启用">
          <template #cell="{ record }">
            <a-switch size="small" @change="handleCheatOnOff(record, $event)" v-model="record.running" />
          </template>
        </a-table-column>
        <a-table-column title="名称" data-index="title"></a-table-column>
        <a-table-column :width="50">
          <template #title>
            <a-button size="mini" shape="circle" @click="handleAddCheat">
              <icon-plus />
            </a-button>
          </template>
          <template #cell="{ record }">
            <a-button size="mini" shape="circle" @click="handleRemoveCheat(record)">
              <icon-delete />
            </a-button>
          </template>
        </a-table-column>
      </template>
    </a-table>
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
import {
  IconDelete,
  IconPlus,
} from "@arco-design/web-vue/es/icon";
import { GAME_CHEAT_DISABLE, GAME_CHEAT_PARSE, GAME_EMULATORJS_CHEAT, GAME_EMULATORJS_GAMEPAD } from '@/common/symbol';
import { $emit } from '@/hooks/useEventBus';
import { useControlerStore, useGameStore } from '@/store';
import { IGameCheat } from '@/types';
import { Input, Message, Modal } from '@arco-design/web-vue';

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
  closeButton && closeButton.click();
}

function handleCheat(event: any) {
  $emit(GAME_EMULATORJS_CHEAT);
  const closeButton = document.querySelector('.arco-drawer-close-btn');
  //@ts-ignore
  closeButton && closeButton.click();
}

function handleAddCheat() {
  let title = "";
  let code = "";
  const InputInstance = h("div", [
    h("span", "名称"),
    h(Input, {
      defaultValue: title,
      placeholder: "请输入名称...",
      onInput: (v: string) => {
        title = v;
      },
    }),
    h("span", "代码"),
    h(Input, {
      defaultValue: code,
      placeholder: "请输入代码...（示例：0045-01-02）",
      onInput: (v: string) => {
        code = v;
      },
    }),
  ]);

  Modal.confirm({
    title: `添加金手指`,
    cancelText: "取消",
    content: () => InputInstance,
    onBeforeOk: (done) => {
      if (!title) {
        Message.error("名称不能为空");
        done(false);
        return;
      }

      if (title.length > 100) {
        Message.error("名称过长");
        done(false);
        return;
      }

      if (!code) {
        Message.error("代码不能为空");
        done(false);
        return;
      }
      if (gameStore.addCheat(title, code)) {
        Message.success("添加成功");
        done(true);
      } else {
        Message.error("代码重复");
        done(false);
      }
    },
  });
}

function handleRemoveCheat(cheat: IGameCheat) {
  Modal.warning({
    title: "是否删除代码？",
    content: "删除后无法恢复",
    hideCancel: false,
    cancelText: "取消",
    onOk() {
      $emit(GAME_CHEAT_DISABLE, cheat.code);
      gameStore.removeCheat(cheat.code);
    },
  });
}


function handleCheatOnOff(cheat: IGameCheat, value: string | number | boolean) {
  if (value) {
    $emit(GAME_CHEAT_PARSE, cheat.code);
  } else {
    $emit(GAME_CHEAT_DISABLE, cheat.code);
  }
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
