const { resolve, basename, extname, join } = require('path')
const { readFileSync, statSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmdirSync, unlinkSync, renameSync,copyFileSync } = require('fs')
const { createHash } = require('crypto')
const { Buffer } = require('buffer')

window.preload = {
  resolve,
  basename,
  extname,
  join,
  readFileSync,
  statSync,
  writeFileSync,
  mkdirSync,
  createHash,
  Buffer,
  existsSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  renameSync,
  copyFileSync
}