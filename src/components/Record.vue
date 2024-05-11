<template>
  <div class="game-record">
    <a-list>
      <a-list-item v-for="rec in gameStore.records" action-layout="vertical">
        <a-list-item-meta :title="rec.title">
          <template #avatar>
            <a-avatar shape="square">
              <img alt="avatar" :src="rec.img" />
            </a-avatar>
          </template>
        </a-list-item-meta>
        <template #actions>
          <a-button :status="rec.core == 'JSNES' ? 'normal' : 'warning'" type="outline" size="mini"
            disabled>{{ rec.core }}</a-button>
          <a-button status="success" size="mini" @click="loadRecord(rec.id)">读取</a-button>
          <a-button status="danger" size="mini" @click="removeRecord(rec.id)">删除</a-button>
        </template>
      </a-list-item>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { GAME_LOAD_RECORD } from '@/common/symbol';
import { $emit } from '@/hooks/useEventBus';
import { useGameStore } from '@/store';

const gameStore = useGameStore()

function loadRecord(id: string) {
  const rec = gameStore.loadRecord(id);
  if (rec) {
    if (gameStore.lastCore != rec.core) {
      gameStore.loading = true
      gameStore.core = rec.core
    }
    if (!gameStore.loading) {
      $emit(GAME_LOAD_RECORD, rec);
    } else {
      const cancel = watch(
        () => gameStore.loading,
        (val) => {
          val ? null : $emit(GAME_LOAD_RECORD, rec);
          cancel();
        }
      );
    }
  }
}
function removeRecord(id: string) {
  gameStore.removeRecords(id);
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
