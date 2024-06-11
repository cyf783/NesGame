import { useGameStore } from "@/store";
import { IGameHandler } from "@/types";
import { Message } from "@arco-design/web-vue";
import { GAME_CORE_EMULATOR_JS } from "@/utils/constant";

export const useEjs = (core: any): IGameHandler => {
  const gameStore = useGameStore()
  return {
    loadRecord: (rec: Uint8Array) => {
      if (core) {
        core.window.EJS_emulator.gameManager.loadState(rec);
        Message.success("游戏存档加载成功")
      }
    },
    saveRecord: async () => {
      if (core) {
        const state = await core.window.EJS_emulator.gameManager.getState();
        const screenshot = await core.window.EJS_emulator.gameManager.screenshot();
        var reader = new FileReader();
        reader.readAsDataURL(new Blob([screenshot]));
        reader.onload = function (e) {
          //@ts-ignore
          gameStore.saveRecord(state, e.target?.result, GAME_CORE_EMULATOR_JS)
          Message.success("游戏存档保存成功")
        };
      }
    },
    setKeys: (keys: any) => {
    },
    reset: () => {
      if (core) {
        if (core.window.EJS_emulator.isNetplay && core.window.EJS_emulator.netplay.owner) {
          core.window.EJS_emulator.gameManager.saveSaveFiles();
          core.window.EJS_emulator.gameManager.restart();
          core.window.EJS_emulator.netplay.reset();
          core.window.EJS_emulator.netplay.sendMessage({ restart: true });
          core.window.EJS_emulator.play();
        } else if (!core.window.EJS_emulator.isNetplay) {
          core.window.EJS_emulator.gameManager.saveSaveFiles();
          core.window.EJS_emulator.gameManager.restart();
        }
      }
    },
    play: () => {
      if (core) {
        if (core.window.EJS_emulator.isNetplay && core.window.EJS_emulator.netplay.owner) {
          core.window.EJS_emulator.play();
          core.window.EJS_emulator.netplay.sendMessage({ play: true });
        } else if (!core.window.EJS_emulator.isNetplay) {
          core.window.EJS_emulator.play();
        }
      }
    },
    pause: () => {
      if (core) {
        if (core.window.EJS_emulator.isNetplay && core.window.EJS_emulator.netplay.owner) {
          core.window.EJS_emulator.pause();
          core.window.EJS_emulator.netplay.sendMessage({ pause: true });
        } else if (!core.window.EJS_emulator.isNetplay) {
          core.window.EJS_emulator.pause();
        }
      }
    },
    setVolume: (num: number) => {
      if (core) {
        core.window.EJS_emulator.setVolume(num * 0.01);
        if (num == 0) {
          core.window.EJS_emulator.muted = true;
        } else {
          core.window.EJS_emulator.muted = false;
        }
      }
    },
    openGamepad: () => {
      core.window.EJS_emulator.controlMenu.style.display = "";
    },
    openCheat: () => {
      core.window.EJS_emulator.cheatMenu.style.display = "";
    },
    cheatParse: () => {
    },
    cheatDisable: () => {
    },
  };
};
