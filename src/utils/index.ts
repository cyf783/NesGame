import type { Component, Ref } from "vue";
import { ref } from "vue";

export const useInstance = <
  T extends abstract new (...args: any[]) => Component
>() => ref() as Ref<InstanceType<T>>;

export const useElement = <T extends HTMLElement>() => ref() as Ref<T>;

export function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

export function uint8ArrayToString(uint8Arr: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(uint8Arr);
}
export * from "./env";
export * from "./time";
export * from "./utools";
export * from "./storage";
