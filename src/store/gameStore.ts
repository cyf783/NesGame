import { defineStore } from "pinia";
//@ts-ignore
import { deflate, inflate } from "pako";
import {
  getAttachment,
  getCurrentTime,
  getFeatures,
  getItem,
  postAttachment,
  removeItem,
  setItem,
} from "@/utils";
import { IGameRecord, IGameRuntimeExtend, ITreeItem } from "@/types";
import {
  GAME_CORE,
  GAME_CORE_EMULATOR_JS,
  GAME_CORE_JSNES,
  GAME_LAST,
  GAME_RECORD,
  GAME_RECORD_ATTACHMENT,
} from "@/utils/constant";
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
      core: GAME_CORE_EMULATOR_JS,
      records: [],

      id: GAME_DEFAULT.id,
      title: GAME_DEFAULT.title,
      path: GAME_DEFAULT.path,
      ext: GAME_DEFAULT.ext,
    } as IGameRuntimeExtend;
  },
  getters: {
    featureKey: (state) => {
      return "game/" + state.id;
    },
    isNes: (state) => {
      return state.ext == "nes";
    },
    isJsnes: (state) => {
      return (
        (state.ext == "nes" ? state.core : GAME_CORE_EMULATOR_JS) ==
        GAME_CORE_JSNES
      );
    },
    isEmulatorJS: (state) => {
      return (
        (state.ext == "nes" ? state.core : GAME_CORE_EMULATOR_JS) ==
        GAME_CORE_EMULATOR_JS
      );
    },
    lastCore: (state) => {
      return state.ext == "nes" ? state.core : GAME_CORE_EMULATOR_JS;
    },
  },
  actions: {
    init() {
      const c = getItem(GAME_CORE);
      this.core = c ? c : GAME_CORE_EMULATOR_JS;
      const lastGame = getItem(GAME_LAST);
      if (lastGame) {
        this.$patch({
          id: lastGame.key,
          title: lastGame.title,
          path: lastGame.path,
          ext: lastGame.ext ? lastGame.ext : GAME_DEFAULT.ext,
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
              ext: first.ext ? first.ext : GAME_DEFAULT.ext,
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
        ext: game.ext ? game.ext : GAME_DEFAULT.ext,
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
    saveRecord(data: Uint8Array, img: string, coreType: string) {
      return new Promise((resolve) => {
        const rid = "r_" + new Date().getTime();
        this.records.push({
          id: rid,
          title: `保存于 ${getCurrentTime()}`,
          core: coreType ? coreType : GAME_CORE_JSNES,
          img: img,
        });
        postAttachment(
          GAME_RECORD_ATTACHMENT + this.id + "/" + rid,
          deflate(data),
          "text/plain"
        );
        setItem(GAME_RECORD + this.id, this.records);
        resolve(true);
      });
    },
    loadRecord(id: string) {
      return new Promise<IGameRecord | null>((resolve) => {
        for (let i = 0; i < this.records.length; i++) {
          const r = this.records[i];
          if (r.id == id) {
            const td = getAttachment(
              GAME_RECORD_ATTACHMENT + this.id + "/" + id
            );
            if (td) {
              r.data = inflate(td);
              resolve(r);
            }
          }
        }
        resolve(null);
      });
    },
    removeRecords(id: string) {
      for (let i = this.records.length - 1; i >= 0; i--) {
        if (this.records[i].id === id) {
          this.records.splice(i, 1);
        }
      }
      setItem(GAME_RECORD + this.id, this.records);
      removeItem(GAME_RECORD_ATTACHMENT + this.id + "/" + id);
    },
    clearRecords() {
      this.records = [];
      setItem(GAME_RECORD + this.id, this.records);
    },
    saveCore() {
      setItem(GAME_CORE, this.core);
    },
  },
});
