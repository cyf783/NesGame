import { GAME_DEFAULT, GAME_REPO } from "@/data/games";
import { ITreeBase, ITreeItem } from "@/types";
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
      const res = filterNode(state.searchKey, state.data);
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
      state.expandedKeys = keys;
      return res;
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
    async init() {
      const treeDataDb = getItem(GAME_TREE_DATA);
      if (treeDataDb) {
        this.data = treeDataDb;
      } else {
        await this.reset();
      }
    },
    async reset() {
      try {
        const response = await fetch(GAME_REPO);
        if (!response.ok) {
          throw new Error('Failed to fetch game data');
        }
        const data = await response.json();
        this.restory(data);
      } catch (error) {
        console.error('Error resetting tree data:', error);
      }
    },
    restory(data: ITreeBase[]) {
      const loop = (data: ITreeBase[]): any => {
        if (data) {
          const res = data.map((item) => {
            if (item.children) {
              return {
                key: createKey(item.title),
                title: item.title,
                children: loop(item.children),
              };
            } else {
              return {
                //@ts-ignore
                key: createKey(item.path),
                title: item.title,
                path: item.path,
                ext: item.ext ? item.ext : GAME_DEFAULT.ext,
              };
            }
          });
          return res;
        }
      };
      const res = loop(data);
      this.data = res;
      this.saveDB();
    },
    expandedAll() {
      this.expandedKeys = this.allExpandedKeys;
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
