import type {
  resolve as _resolve,
  basename as _basename,
  extname as _extname,
  join as _join,
} from "path";
import type {
  readFileSync as _readFileSync,
  statSync as _statSync,
  mkdirSync as _mkdirSync,
  writeFileSync as _writeFileSync,
  existsSync as _existsSync,
  readdirSync as _readdirSync,
  rmdirSync as _rmdirSync,
  unlinkSync as _unlinkSync,
  renameSync as _renameSync,
  copyFileSync as _copyFileSync,
} from "fs";
import type { createHash as _createHash } from "crypto";
import type { Buffer as _Buffer } from "buffer";

declare global {
  interface Window {
    preload: {
      resolve: typeof _resolve;
      basename: typeof _basename;
      extname: typeof _extname;
      join: typeof _join;
      readFileSync: typeof _readFileSync;
      statSync: typeof _statSync;
      mkdirSync: typeof _mkdirSync;
      writeFileSync: typeof _writeFileSync;
      existsSync: typeof _existsSync;
      readdirSync: typeof _readdirSync;
      rmdirSync: typeof _rmdirSync;
      unlinkSync: typeof _unlinkSync;
      renameSync: typeof _renameSync;
      copyFileSync: typeof _copyFileSync;
      createHash: typeof _createHash;
      Buffer: typeof _Buffer;
    };
  }
}

function emptyFuncFactory() {
  return new Function();
}

// 导出以供类型静态分析 实际取值是在运行时进行的
// 需要自己对isElectron进行判断

export const resolve =
  window.preload?.resolve || (emptyFuncFactory() as typeof _resolve);

export const basename =
  window.preload?.basename || (emptyFuncFactory() as typeof _basename);

export const extname =
  window.preload?.extname || (emptyFuncFactory() as typeof _extname);

export const join =
  window.preload?.join || (emptyFuncFactory() as typeof _join);

export const readFileSync =
  window.preload?.readFileSync || (emptyFuncFactory() as typeof _readFileSync);

export const statSync =
  window.preload?.statSync || (emptyFuncFactory() as typeof _statSync);

export const mkdirSync =
  window.preload?.mkdirSync || (emptyFuncFactory() as typeof _mkdirSync);

export const writeFileSync =
  window.preload?.writeFileSync ||
  (emptyFuncFactory() as typeof _writeFileSync);

export const existsSync =
  window.preload?.existsSync || (emptyFuncFactory() as typeof _existsSync);

export const readdirSync =
  window.preload?.readdirSync || (emptyFuncFactory() as typeof _readdirSync);

export const rmdirSync =
  window.preload?.rmdirSync || (emptyFuncFactory() as typeof _rmdirSync);

export const unlinkSync =
  window.preload?.unlinkSync || (emptyFuncFactory() as typeof _unlinkSync);

export const renameSync =
  window.preload?.renameSync || (emptyFuncFactory() as typeof _renameSync);

export const copyFileSync =
  window.preload?.copyFileSync || (emptyFuncFactory() as typeof _copyFileSync);

export const createHash =
  window.preload?.createHash || (emptyFuncFactory() as typeof _createHash);

export const Buffer =
  window.preload?.Buffer || (emptyFuncFactory() as typeof _Buffer);
