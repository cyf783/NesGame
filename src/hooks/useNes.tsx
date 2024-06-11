import { useGameStore } from "@/store";
import { IGameHandler } from "@/types";
import { stringToUint8Array, uint8ArrayToString } from "@/utils";
import { GAME_CORE_JSNES } from "@/utils/constant";
import { Message } from "@arco-design/web-vue";

export const useNes = (core: any): IGameHandler => {
  const gameStore = useGameStore()
  return {
    loadRecord: (rec: Uint8Array) => {
      if (core) {
        core.window.JSNES.loadNesData(JSON.parse(uint8ArrayToString(rec)));
        Message.success("游戏存档加载成功")
      }
    },
    saveRecord: async () => {
      if (core) {
        const data = await core.window.JSNES.getNesData();
        const screenshot = await core.window.JSNES.getNesImg();
        gameStore.saveRecord(stringToUint8Array(JSON.stringify(data)), screenshot, GAME_CORE_JSNES)
        Message.success("游戏存档保存成功")
      }
    },
    setKeys: (keys: any) => {
      if (core) {
        core.window.JSNES.setKeys(keys);
      }
    },
    reset: () => {
      if (core) {
        core.window.JSNES.reset();
      }
    },
    play: () => {
      if (core) {
        core.window.JSNES.play();
      }
    },
    pause: () => {
      if (core) {
        core.window.JSNES.pause();
      }
    },
    setVolume: (num: number) => {
      if (core) {
        core.window.JSNES.setVolume(num);
      }
    },
    openGamepad: () => {
    },
    openCheat: () => {
    },
    cheatParse: (code:string) => {
      core.window.JSNES.cheat.parse(code)
    },
    cheatDisable: (code:string) => {
      core.window.JSNES.cheat.disable(code)
    },
  };
};
