import { defineStore } from "pinia";
import { useTreeStore } from "./treeStore";
import { useGameStore } from "./gameStore";
import { getItem, removeItem, setItem } from "@/utils";
import { GAME_TREE_DATA, GAME_LAST, GAME_VOLUME } from "@/utils/constant";

export const useMainStore = defineStore("MainStore", {
  state: () => ({
    volume: 80,
    isReady:false
  }),
  actions: {
    init() {
      const v =  getItem(GAME_VOLUME)
      this.volume = v==0||v?v:80;
      const treeStore = useTreeStore();
      treeStore.init();
      const gameStore = useGameStore();
      gameStore.init();
      treeStore.selected = {
        title: gameStore.title,
        path: gameStore.path,
        key: gameStore.id
      };
      this.isReady = true;
    },
    reset() {
      removeItem(GAME_LAST);
      removeItem(GAME_TREE_DATA);
      this.init();
    },
    saveGain(){
      setItem(GAME_VOLUME,this.volume);
    }
  },
});
