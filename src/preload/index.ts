declare global {
  interface Window {
    preload: {
      setOpacity: (data: number) => void;
      setAlwaysOnTop: (data: boolean) => void;
      gamePause: () => void;
    };
  }
}

export const setOpacity =
  window.preload?.setOpacity ||
  function (data: number) {
    document.getElementById("app")?.setAttribute("style", `opacity: ${data}`);
  };

export const setAlwaysOnTop =
  window.preload?.setAlwaysOnTop || function (data: boolean) {};
