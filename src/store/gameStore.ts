import { defineStore } from "pinia";
import { getCurrentTime, getFeatures, getItem, setItem } from "@/utils";
import { IGameRuntimeExtend, ITreeItem } from "@/types";
import { GAME_CORE_JSNES, GAME_LAST, GAME_RECORD } from "@/utils/constant";
import { useTreeStore } from "./treeStore";
import { firstNode } from "@/utils/tree";
import { GAME_DEFAULT } from "@/data/games";

export const useGameStore = defineStore("GameStore", {
  state: () => {
    return {
      isEmpty: true,
      isFeature: false,
      isPlaying: false,
      loading: true,

      id: GAME_DEFAULT.id,
      title: GAME_DEFAULT.title,
      path: GAME_DEFAULT.path,
      ext: GAME_DEFAULT.ext,
      records: [],
    } as IGameRuntimeExtend;
  },
  getters: {
    featureKey: (state) => {
      return "game/" + state.id;
    },
  },
  actions: {
    init() {
      const lastGame = getItem(GAME_LAST);
      if (lastGame) {
        this.$patch({
          id: lastGame.key,
          title: lastGame.title,
          path: lastGame.path,
          ext: lastGame.ext?lastGame.ext:GAME_DEFAULT.ext,
        });
      } else {
        const treeStore = useTreeStore();
        if (treeStore) {
          const first = firstNode(treeStore.treeData);
          if (first) {
            this.$patch({
              id: first.key,
              title: first.title,
              path: first.path,
              ext: first.ext,
            });
            return;
          }
        }
        this.$patch(GAME_DEFAULT);
      }
    },
    loadGame(game: ITreeItem) {
      if (game.key == this.id && this.isPlaying) {
        return;
      }
      const _r = getItem(GAME_RECORD + game.key);
      this.$patch({
        id: game.key,
        title: game.title,
        path: game.path,
        ext: game.ext,
        records: _r ? _r : [],
      });
      setItem(GAME_LAST, game);
      const features = getFeatures();
      if (features?.length) {
        const r = features.filter((f) => f.code === this.featureKey);
        this.isFeature = r.length > 0;
      }
      this.loading = true;
    },
    saveRecord(data: string, img: string, coreType: string) {
      this.records.push({
        id: "r_" + new Date().getTime(),
        title: `保存于 ${getCurrentTime()}`,
        core: coreType ? coreType : GAME_CORE_JSNES,
        data: data,
        img: img,
      });
      setItem(GAME_RECORD + this.id, this.records);
    },
    loadRecord(id: string) {
      for (let i = 0; i < this.records.length; i++) {
        const r = this.records[i];
        if (r.id == id) {
          return r;
        }
      }
      return null;
    },
    removeRecords(id: string) {
      for (let i = this.records.length - 1; i >= 0; i--) {
        if (this.records[i].id === id) {
          this.records.splice(i, 1);
        }
      }
      setItem(GAME_RECORD + this.id, this.records);
    },
    clearRecords() {
      this.records = [];
      setItem(GAME_RECORD + this.id, this.records);
    },
  },
});
