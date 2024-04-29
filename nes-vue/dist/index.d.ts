import { ComponentOptionsMixin } from 'vue';
import { DefineComponent } from 'vue';
import { Directive } from 'vue';
import { ExtractPropTypes } from 'vue';
import { NESInstance } from 'jsnes';
import { PropType } from 'vue';
import { PublicProps } from 'vue';

declare type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;

declare type __VLS_Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

declare type __VLS_TypePropsToRuntimeProps<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: PropType<T[K]>;
        required: true;
    };
};

declare type __VLS_WithDefaults<P, D> = {
    [K in keyof Pick<P, keyof P>]: K extends keyof D ? __VLS_Prettify<P[K] & {
        default: D[K];
    }> : P[K];
};

export declare interface Controller {
    UP: string;
    DOWN: string;
    LEFT: string;
    RIGHT: string;
    A: string;
    B: string;
    C: string;
    D: string;
    SELECT: string;
    START: string;
}

declare type ControllerKey = keyof Controller;

export declare interface EmitErrorObj {
    code: number;
    message: string;
}

declare interface Idb<T = any> {
    dbName: string;
    setItem(id: string, data: T): void;
    getItem(id: string): T | Promise<T>;
    removeItem(id: string): void;
    clear(): void;
}

export declare const nes: NESInstance;

export declare const NesVue: DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToRuntimeProps<{
    url: string;
    autoStart?: boolean | undefined;
    width?: string | number | undefined;
    height?: string | number | undefined;
    label?: string | undefined;
    gain?: number | undefined;
    noClip?: boolean | undefined;
    storage?: Idb<any> | "indexedDB" | "localStorage" | undefined;
    debugger?: boolean | undefined;
    turbo?: number | undefined;
    dbName?: string | undefined;
    p1?: Partial<Controller> | undefined;
    p2?: Partial<Controller> | undefined;
}>, {
    autoStart: boolean;
    width: string;
    height: string;
    label: string;
    gain: number;
    noClip: boolean;
    storage: string;
    debugger: boolean;
    turbo: number;
    dbName: string;
    p1: () => {
        UP: string;
        DOWN: string;
        LEFT: string;
        RIGHT: string;
        A: string;
        B: string;
        C: string;
        D: string;
        SELECT: string;
        START: string;
    };
    p2: () => {
        UP: string;
        DOWN: string;
        LEFT: string;
        RIGHT: string;
        A: string;
        B: string;
        C: string;
        D: string;
        SELECT: string;
        START: string;
    };
}>, {
    start: (url?: string) => void;
    reset: () => void;
    stop: () => void;
    pause: () => void;
    play: () => void;
    save: (id: string) => boolean | undefined;
    load: (id: string) => boolean | undefined;
    remove: (id: string) => void;
    clear: () => void;
    screenshot: (download?: boolean, imageName?: string) => HTMLImageElement | undefined;
    fm2URL: (url: string, fix?: number) => Promise<() => void>;
    fm2Text: (text: string, fix?: number) => Promise<() => void>;
    fm2Play: () => void;
    fm2Stop: () => void;
    cheatCode: (code: string) => void;
    cancelCheatCode: (code: string) => void;
    cancelCheatCodeAll: () => void;
    getGameData: () => SaveData;
    loadGameData: (saveData: SaveData) => void;
}, unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
    fps: (fps: number) => void;
    success: () => void;
    error: (error: EmitErrorObj) => void;
    saved: (saved: SavedOrLoaded) => void;
    loaded: (loaded: SavedOrLoaded) => void;
    "update:url": (path: string) => void;
    removed: (id: string) => void;
}, string, PublicProps, Readonly< ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToRuntimeProps<{
    url: string;
    autoStart?: boolean | undefined;
    width?: string | number | undefined;
    height?: string | number | undefined;
    label?: string | undefined;
    gain?: number | undefined;
    noClip?: boolean | undefined;
    storage?: Idb<any> | "indexedDB" | "localStorage" | undefined;
    debugger?: boolean | undefined;
    turbo?: number | undefined;
    dbName?: string | undefined;
    p1?: Partial<Controller> | undefined;
    p2?: Partial<Controller> | undefined;
}>, {
    autoStart: boolean;
    width: string;
    height: string;
    label: string;
    gain: number;
    noClip: boolean;
    storage: string;
    debugger: boolean;
    turbo: number;
    dbName: string;
    p1: () => {
        UP: string;
        DOWN: string;
        LEFT: string;
        RIGHT: string;
        A: string;
        B: string;
        C: string;
        D: string;
        SELECT: string;
        START: string;
    };
    p2: () => {
        UP: string;
        DOWN: string;
        LEFT: string;
        RIGHT: string;
        A: string;
        B: string;
        C: string;
        D: string;
        SELECT: string;
        START: string;
    };
}>>> & {
    onFps?: ((fps: number) => any) | undefined;
    onSuccess?: (() => any) | undefined;
    onError?: ((error: EmitErrorObj) => any) | undefined;
    onSaved?: ((saved: SavedOrLoaded) => any) | undefined;
    onLoaded?: ((loaded: SavedOrLoaded) => any) | undefined;
    "onUpdate:url"?: ((path: string) => any) | undefined;
    onRemoved?: ((id: string) => any) | undefined;
}, {
    p1: Partial<Controller>;
    p2: Partial<Controller>;
    storage: Idb | 'indexedDB' | 'localStorage';
    autoStart: boolean;
    width: number | string;
    height: number | string;
    label: string;
    gain: number;
    noClip: boolean;
    debugger: boolean;
    turbo: number;
    dbName: string;
}, {}>;

export declare type NesVueInstance = InstanceType<typeof NesVue>;

export declare interface NesVueProps {
    url: string;
    autoStart?: boolean;
    width?: number | string;
    height?: number | string;
    label?: string;
    gain?: number;
    clip?: boolean;
    storage?: "indexedDB" | "localStorage" | Idb;
    debugger?: boolean;
    turbo?: number;
    p1?: Partial<Controller>;
    p2?: Partial<Controller>;
}

export declare interface SaveData {
    path: string;
    data: {
        cpu: any;
        mmap: any;
        ppu: any;
        vramMemZip: any;
        nameTableZip: any;
        cpuMemZip: any;
        ptTileZip: any;
        frameCounter: number;
    };
}

export declare interface SavedOrLoaded {
    id: string;
    message: string;
    target: "indexedDB" | "localStorage" | string;
}

/**
 * v-gamepad directive
 * @example
 * ```vue
 * <script setup>
 * import { NesVue, vGamepad } from 'nes-vue'
 * </script>
 *
 * <template>
 *   <nes-vue
 *     url="https://taiyuuki.github.io/nes-vue/Super Mario Bros (JU).nes"
 *   />
 *   <button v-gamepad="'RIGHT'">RIGHT</button>
 * </template>
 * ```
 */
export declare const vGamepad: Directive<HTMLElement, ControllerKey | ControllerKey[]>;

export { }
