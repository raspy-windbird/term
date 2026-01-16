/**
 * ターミナル制御用ユーティリティ
 * TS移行時には namespace または module として定義可能
 */
export const UTILS = {
    /** @type {string} エスケープ */
    ESC: '\x1b[',

    /** @type {string} カーソルを非表示 */
    HIDE_CURSOR: '\x1b[?25l',

    /** @type {string} カーソルを表示 */
    SHOW_CURSOR: '\x1b[?25h',

    /** @type {string} 現在の行をクリアして行頭に戻る */
    CLEAR_LINE: '\x1b[2K\r',

    /** @type {string} オルタネートバッファ（別画面）へ切り替え */
    ENTER_ALT_SCREEN: '\x1b[?1049h',
    /** @type {string} 通常バッファ（元の画面）へ戻る */
    EXIT_ALT_SCREEN: '\x1b[?1049l',
    /** @type {string} 画面全体の消去とカーソルホーム移動 */
    CLEAR_SCREEN: '\x1b[2J\x1b[H',

    GET_UP: (n:number):string => `\x1b[${n}A`,

    /**
     * ANSIカラー
     */
    COLOR: {
        /** @type {string} 標準の緑 */
        GREEN: '\x1b[32m',
        /** @type {string} 明るい緑 */
        BRIGHT_GREEN: '\x1b[92m',
        /** @type {string} 深い緑 */
        DARK_GREEN: '\x1b[38;5;22m',
        /** @type {string} 赤 */
        RED: '\x1b[31m',
        /** @type {string} スタイルリセット */
        RESET: '\x1b[0m'
    },

    /**
     * 指定範囲のランダムな整数を生成
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    RANDOM: (min:number, max:number):number => Math.floor(Math.random() * (max - min + 1) + min)
};
