declare global {
  interface Window {
    preload: {
      setOpacity: (data:number) => void;
    };
  }
}

export const setOpacity =
  window.preload?.setOpacity || function(data: number){
    document.getElementById("app")?.setAttribute("style", `opacity: ${data}`);
  };
