import { defineStore } from "pinia";
import { useTreeStore } from "./treeStore";
import { useGameStore } from "./gameStore";
import { getItem, removeItem, setItem } from "@/utils";
import {
  GAME_TREE_DATA,
  GAME_LAST,
  GAME_VOLUME,
  GAME_TRANSPARENT,
} from "@/utils/constant";
import { useControlerStore } from "./controlerStore";

export const useMainStore = defineStore("MainStore", {
  state: () => ({
    volume: 80,
    lastVolume: 80,
    transparent: 100,
    alwaysOnTop: false,
    isReady: false,
    isDetach: true,
    tips: "游戏加载中...",
  }),
  actions: {
    init() {
      const v = getItem(GAME_VOLUME);
      this.volume = v == 0 || v ? v : 80;
      const t = getItem(GAME_TRANSPARENT);
      this.transparent = t == 0 || t ? t : 100;
      const treeStore = useTreeStore();
      treeStore.init();
      const gameStore = useGameStore();
      gameStore.init();
      treeStore.selected = {
        title: gameStore.title,
        path: gameStore.path,
        key: gameStore.id,
        ext: gameStore.ext,
      };
      const controlerStore = useControlerStore();
      controlerStore.init();
      this.isReady = true;
    },
    reset() {
      removeItem(GAME_LAST);
      removeItem(GAME_TREE_DATA);
      this.init();
    },
    mute() {
      if (this.volume) {
        this.lastVolume = this.volume;
        this.volume = 0;
      } else {
        this.volume = this.lastVolume ? this.lastVolume : 80;
      }
      this.saveGain();
    },
    setOnTop() {
      this.alwaysOnTop = !this.alwaysOnTop;
    },
    saveGain() {
      setItem(GAME_VOLUME, this.volume);
    },
    saveTransparent() {
      setItem(GAME_TRANSPARENT, this.transparent);
    },
  },
});
