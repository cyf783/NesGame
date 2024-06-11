export interface ITreeBase {
  title: string;
  path?: string;
  ext?: string;
  children?: ITreeItem[];
}

export interface ITreeItem extends ITreeBase {
  key: string;
}

export interface IGame {
  id: string;
  title: string;
  path: string;
  ext: string;
}

export interface IGameCheat {
  title: string;
  code: string;
}

export interface IGameCheatRuntimeExtend extends IGameCheat {
  running: boolean;
}

export interface IGameRecord {
  id: string;
  img: string;
  title: string;
  data?: Uint8Array | null | undefined;
  core: string;
}

// 运行时接口定义
export interface IGameRuntimeExtend extends IGame {
  isEmpty: boolean;
  isFeature: boolean;
  records: IGameRecord[];
  cheats: IGameCheatRuntimeExtend[];
  isPlaying: boolean;
  loading: boolean;
  core: string;
}

export interface IGameHandler {
  loadRecord: Function;
  saveRecord: Function;
  setKeys: Function;
  reset: Function;
  play: Function;
  pause: Function;
  setVolume: Function;
  openGamepad: Function;
  openCheat: Function;
  cheatParse: Function;
  cheatDisable: Function;
}