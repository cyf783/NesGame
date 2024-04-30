<template>
  <div class="side-bar">
    <div class="btn-list">
      <a-button title="添加游戏" @click="addFile(false)">
        <template #icon>
          <icon-plus />
        </template>
      </a-button>
      <a-button title="添加分类" @click="addFolder(false)">
        <template #icon>
          <icon-folder-add />
        </template>
      </a-button>
      <a-button title="删除" @click="handleDelete">
        <template #icon>
          <icon-delete />
        </template>
      </a-button>
      <a-button title="重命名" @click="handleRename">
        <template #icon>
          <icon-edit />
        </template>
      </a-button>
      <a-button :title="treeStore.expandedKeys.length ? '折叠' : '展开'" @click="toggleExpanded">
        <template #icon>
          <icon-double-up v-if="treeStore.expandedKeys.length" />
          <icon-double-down v-else />
        </template>
      </a-button>
    </div>

    <a-dropdown trigger="contextMenu" align-point show-arrow :style="{ display: 'block' }">
      <a-tree :data="treeStore.treeData" :selected-keys="[treeStore.selected!.key]"
        v-model:expanded-keys="treeStore.expandedKeys" @select="handleSelect" @drop="drop" :allow-drop="({ dropNode, dropPosition }) => {
          if (dropNode.children) {
            return true
          }
          // 不允许向子节点内部拖拽 但是-1 | 1可以修改顺序
          return dropPosition !== 0
        }
          " showLine draggable block-node @contextmenu="dropdownContextMenu">
        <template #switcher-icon="// @ts-ignore
          node,
          { isLeaf }">
          <IconDown v-if="!isLeaf"></IconDown>
          <template v-else>
            <IconRobot v-if="node?.children === undefined"></IconRobot>
            <IconFolder v-else></IconFolder>
          </template>
        </template>
      </a-tree>
      <template #content>
        <a-doption v-if="!isNotRoot" @click="addFolder(true)">
          <template #icon>
            <icon-folder-add />
          </template>
          <template #default>添加分类(根)</template>
        </a-doption>
        <a-doption v-if="!isNotRoot" @click="addFile(true)">
          <template #icon>
            <icon-plus />
          </template>
          <template #default>添加游戏(根)</template>
        </a-doption>
        <a-doption v-if="isNotRoot && treeStore.selected && treeStore.selected.children" @click="addFolder(false)">
          <template #icon>
            <icon-folder-add />
          </template>
          <template #default>添加分类</template>
        </a-doption>
        <a-doption v-if="isNotRoot && treeStore.selected && treeStore.selected.children" @click="addFile(false)">
          <template #icon>
            <icon-plus />
          </template>
          <template #default>添加游戏</template>
        </a-doption>
        <a-doption v-if="isNotRoot" @click="handleRename">
          <template #icon>
            <icon-edit />
          </template>
          <template #default>重命名</template>
        </a-doption>
        <a-doption v-if="isNotRoot" @click="handleDelete">
          <template #icon>
            <icon-delete />
          </template>
          <template #default>删除</template>
        </a-doption>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@/hooks/useEventBus'
import { useTreeData } from '@/hooks/useTreeData'
import { useTreeDrag } from '@/hooks/useTreeDrag'
import { useGameStore, useTreeStore } from '@/store'
import {
  SESRCH_KEY,
} from '@/common/symbol'
import { collectAllParentKeys, findNodeByKey } from '@/utils/tree'

const gameStore = useGameStore()
const treeStore = useTreeStore();

const { addFile, addFolder, handleDelete, handleRename } = useTreeData()
const { drop } = useTreeDrag()

/**
 * 选中树中的节点时触发
 */
function handleSelect(_: any, data: any) {
  // 更新当前激活的节点
  treeStore.selected = data.node

  if (data.node?.children) {
    // 切换分类展开状态
    if (treeStore.expandedKeys.includes(data.node.key)) {
      treeStore.removeExpandedKey(data.node.key);
    } else {
      treeStore.addExpandedKey(data.node.key);
    }
  }
}

watch(() => treeStore.selected, (newVal, oldVal) => {
  // 选中的节点是文件
  if (newVal && !newVal.children) {
    gameStore.loadGame(newVal)
    // 从当前游戏向上找到所有父节点 并展开
    const keys = collectAllParentKeys(newVal.key, treeStore.data)
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      if (!treeStore.expandedKeys.includes(key)) {
        treeStore.addExpandedKey(key)
      }
    }
  }
},
  { deep: true })

/**
 * 切换侧栏展开状态
 */
function toggleExpanded() {
  treeStore.expandedKeys = treeStore.expandedKeys.length ? [] : treeStore.allExpandedKeys
}

useEventBus(SESRCH_KEY, (key: string) => {
  treeStore.searchKey = key
})

watch(() => treeStore.data, (newVal, oldVal) => {
  // 有变动就保存
  treeStore.saveDB()
  if (!findNodeByKey(treeStore.selected!.key, treeStore.data)) {
    gameStore.init()
    treeStore.selected = {
      title: gameStore.title, path: gameStore.path,
      key: gameStore.id
    }
  }
  nextTick(() => initEvent())
},
  { deep: true })

watch(() => treeStore.expandedKeys, (newVal, oldVal) => {
  nextTick(() => initEvent())
},
  { deep: true })

function initEvent() {
  const tree = document.querySelector(".arco-tree");
  if (tree) {
    for (let i = 0; i < treeStore.allExpandedKeys.length; i++) {
      const key: string = treeStore.allExpandedKeys[i];
      const e = tree.querySelector(`[data-key="${key}"]`);
      if (e) {
        e.removeEventListener("contextmenu", handleContextMenu)
        e.removeEventListener("dblclick", handleDblclick)
        e.addEventListener("contextmenu", handleContextMenu);
        e.addEventListener("dblclick", handleDblclick);
      }
    }
  }
}

const isNotRoot = ref(true)
let isTreeItem = false;

const dropdownContextMenu = (evt: any) => {
  // 阻止默认行为
  evt.preventDefault();
  // 阻止事件冒泡
  evt.stopPropagation();
  isNotRoot.value = isTreeItem
  isTreeItem = false
};

const handleContextMenu = (evt: any) => {
  const key = evt.currentTarget.getAttribute("data-key")
  // 阻止默认行为
  evt.preventDefault();
  const node = findNodeByKey(key, treeStore.data)
  // 更新当前激活的节点
  treeStore.selected = node
  isTreeItem = true;
};
const handleDblclick = (evt: any) => {
  const key = evt.currentTarget.getAttribute("data-key")
  // 阻止默认行为
  evt.preventDefault();
  // 阻止事件冒泡
  evt.stopPropagation();
  const node = findNodeByKey(key, treeStore.data)
  // 更新当前激活的节点
  treeStore.selected = node
  handleRename()
};

</script>

<style lang="less" scoped>
.side-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  background-color: var(--bg-color);
  overflow: hidden;
  box-shadow: 0 8px 0 0 var(--line-color);
}

.search {
  width: 100%;
  background-color: var(--bg-color);
}

.btn-list {
  width: 100%;
  display: flex;
  flex-direction: row;

  button {
    flex: 1;
    border-radius: 0;
    background-color: var(--nav-item-bg-color);
  }

  .drop-down {
    flex: 1;
  }
}

.arco-tree {
  height: 100%;
  width: 100%;
  align-self: flex-start;
  overflow: auto;

  :deep(.arco-tree-node-title) {
    font-size: 13px;
  }

  .arco-tree-node {
    .arco-btn {
      background-color: var(--bg-color);
    }

    .arco-btn:hover {
      background-color: var(--color-fill-2);
    }
  }
}
</style>
