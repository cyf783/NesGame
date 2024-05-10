export interface ITreeItem {
  title: string;
  key: string;
  path?: string;
  ext?: string;
  children?: ITreeItem[];
}

export interface IGame {
  id: string;
  title: string;
  path: string;
  ext: string;
}

export interface IGameRecord {
  id: string;
  img: string;
  title: string;
  data: string;
  core: string;
}

// 运行时接口定义
export interface IGameRuntimeExtend extends IGame {
  isEmpty: boolean;
  isFeature: boolean;
  records: IGameRecord[];
  isPlaying: boolean;
  loading: boolean;
}
