import { GAME_LIST } from "@/data/games";
import { ITreeItem } from "@/types";
import { getItem, setItem } from "@/utils";
import { GAME_TREE_DATA } from "@/utils/constant";
import { createKey, filterNode } from "@/utils/tree";
import { defineStore } from "pinia";

export const useTreeStore = defineStore("TreeStore", {
  state: () => ({
    data: [] as ITreeItem[],
    searchKey: "" as string,
    selected: {} as ITreeItem | undefined,
    expandedKeys: [] as string[],
  }),
  getters: {
    treeData: (state) => {
      if (!state.searchKey) return state.data;
      return filterNode(state.searchKey, state.data);
    },
    allExpandedKeys: (state) => {
      const keys: string[] = [];
      const loop = (fileItem: ITreeItem[]) => {
        fileItem.forEach((item) => {
          keys.push(item.key);
          if (item.children) {
            loop(item.children);
          }
        });
      };
      loop(state.data);
      return keys;
    },
  },
  actions: {
    init() {
      const treeDataDb = getItem(GAME_TREE_DATA);
      if (treeDataDb) {
        this.data = treeDataDb;
      } else {
        const _treeData: ITreeItem[] = [];
        for (const key in GAME_LIST) {
          if (GAME_LIST.hasOwnProperty(key)) {
            const c = {
              key: createKey(key),
              title: key,
              children: [] as ITreeItem[],
            };
            //@ts-ignore
            for (let i = 0; i < GAME_LIST[key].length; i++) {
              //@ts-ignore
              const g = GAME_LIST[key][i];
              c.children.push({
                key: createKey(g[1]),
                title: g[0],
                path: g[1],
              });
            }
            _treeData.push(c);
          }
        }
        this.data = _treeData;
        this.saveDB();
      }
    },
    addExpandedKey(key: string) {
      this.expandedKeys = [...this.expandedKeys, key];
    },
    removeExpandedKey(key: string) {
      this.expandedKeys = this.expandedKeys.filter((item) => item !== key);
    },
    hasKey(key: string) {
      function loop(ls: ITreeItem[]) {
        for (let i = 0; i < ls.length; i++) {
          const e = ls[i];
          if (!e.children) {
            if (e.key == key) {
              return true;
            }
          } else {
            return loop(e.children);
          }
        }
        return false;
      }
      return loop(this.data);
    },
    saveDB() {
      setItem(GAME_TREE_DATA, this.data);
    },
  },
});
