/**
 * xterm自体は型を持っていますが、
 * local-echoなどをモジュールとしてimportする場合に備えて定義
 */
declare module 'local-echo';

/**
 * Viteのエイリアス（@/）を用いたインポートをTSに認識させるための補助的な定義
 */
declare module '@/Utils' {
    export const UTILS: any;
}