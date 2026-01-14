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

    /**
     * 指定した行数分、カーソルを上に移動させる
     * @param {number} n - 移動する行数
     * @returns {string}
     */
    GET_UP: (n) => `\x1b[${n}A`,

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
    RANDOM: (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
};
