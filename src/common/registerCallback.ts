import { $emit } from "@/hooks/useEventBus";
import {
  ENTER_GAME,
  GAME_TOGGLE_PLAY,
  SESRCH_KEY,
} from "@/common/symbol";
import { isElectron } from "@/utils";
import { useMainStore } from "@/store";

export function registerCallback() {
  if (!isElectron) return;

  utools.onPluginEnter(({ code, type, payload }) => {
    // 通过全局关键字打开文档
    if (code.startsWith("game/")) {
      const docId = code.split("/")[1];
      emitWithWatch(ENTER_GAME, docId);
    }
    // 调用输入框
    utools.setSubInput(search, "搜索...");
  });
  utools.onPluginOut((processExit) => {
    $emit(GAME_TOGGLE_PLAY, "pause");
  })
}

function search(obj: any) {
  $emit(SESRCH_KEY, obj.text);
  utools.findInPage(obj.text);
  if (!obj.text) {
    utools.stopFindInPage("clearSelection");
  }
}

function emitWithWatch(event: symbol, payload?: any) {
  const store = useMainStore();

  if (store.isReady) {
    $emit(event, payload);
  } else {
    window.location.hash = "/";
    // 等待编辑器初始化完毕后emit
    // 执行完毕后立刻cancel掉监听
    const cancel = watch(
      () => store.isReady,
      (val) => {
        val ? $emit(event, payload) : null;
        cancel();
      }
    );
  }
}
