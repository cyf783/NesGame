import { defineStore } from "pinia";
import { getItem, setItem } from "@/utils";
import { GAME_CONTROLER } from "@/utils/constant";

export const useControlerStore = defineStore("ControlerStore", {
  state: () => ({
    p1: {
      UP: "KeyW",
      DOWN: "KeyS",
      LEFT: "KeyA",
      RIGHT: "KeyD",
      A: "KeyK",
      B: "KeyJ",
      C: "KeyI",
      D: "KeyU",
      SELECT: "Space",
      START: "Enter",
    } ,
    p2: {
      UP: "ArrowUp",
      DOWN: "ArrowDown",
      LEFT: "ArrowLeft",
      RIGHT: "ArrowRight",
      A: "Numpad2",
      B: "Numpad1",
      C: "Numpad5",
      D: "Numpad4",
    } ,
    p0: {
      SAVE: "KeyO",
      PAUSE: "KeyP",
      RESET: "KeyR",
      MUTE: "KeyV",
      ON_TOP: "KeyT",
      LOAD_LAST: "KeyY"
    },
  }),
  getters: {
    getSaveKey: (state) => {
      return conversion(state.p0.SAVE);
    },
    getPauseKey: (state) => {
      return conversion(state.p0.PAUSE);
    },
    getResetKey: (state) => {
      return conversion(state.p0.RESET);
    },
    getVolumeKey: (state) => {
      return conversion(state.p0.MUTE);
    },
    getOnTopKey: (state) => {
      return conversion(state.p0.ON_TOP);
    },
    getLoadLastKey: (state) => {
      return conversion(state.p0.LOAD_LAST);
    },
    getP1Key: (state) => {
      const res = [];
      for (const key in state.p1) {
        //@ts-ignore
        const v = state.p1[key];
        res.push({
          key: "p1" + key,
          value: v,
          action: keyboardNameMaps["p1" + key],
        });
      }
      return res;
    },
    getP2Key: (state) => {
      const res = [];
      for (const key in state.p2) {
        //@ts-ignore
        const v = state.p2[key];
        res.push({
          key: "p2" + key,
          value: v,
          action: keyboardNameMaps["p2" + key],
        });
      }
      return res;
    },
    getP0Key: (state) => {
      const res = [];
      for (const key in state.p0) {
        //@ts-ignore
        const v = state.p0[key];
        res.push({
          key: "p0" + key,
          value: v,
          action: keyboardNameMaps["p0" + key],
        });
      }
      return res;
    },
  },
  actions: {
    init() {
      const c = getItem(GAME_CONTROLER);
      if (c) {
        this.$patch(c);
      }
    },
    changeKey(key: string, value: string) {
      if (key.startsWith("p1")) {
        //@ts-ignore
        this.p1[key.replace("p1", "")] = value;
      }
      if (key.startsWith("p2")) {
        //@ts-ignore
        this.p2[key.replace("p2", "")] = value;
      }
      if (key.startsWith("p0")) {
        //@ts-ignore
        this.p0[key.replace("p0", "")] = value;
      }
      setItem(GAME_CONTROLER, {
        p1: this.p1,
        p2: this.p2,
        p0: this.p0,
      });
    },
  },
});

function conversion(key: string) {
  return key.replace("Key", "").replace("Numpad", "");
}

// 游戏按键映射名
const keyboardNameMaps: Record<string, string> = {
  p1UP: "↑",
  p1DOWN: "↓",
  p1LEFT: "←",
  p1RIGHT: "→",
  p1A: "A",
  p1B: "B",
  p1C: "连A",
  p1D: "连B",
  p1SELECT: "选择",
  p1START: "开始",
  p2UP: "↑",
  p2DOWN: "↓",
  p2LEFT: "←",
  p2RIGHT: "→",
  p2A: "A",
  p2B: "B",
  p2C: "连A",
  p2D: "连B",
  p0SAVE: "保存",
  p0PAUSE: "暂停开始",
  p0RESET: "重启",
  p0MUTE: "静音",
  p0ON_TOP: "置顶",
  p0LOAD_LAST: "加载最近存档",
};
