/**
 * ターミナル操作のユーティリティ（分離型）
 */
export const Utils = {
    ESC: '\x1b[',
    HIDE_CURSOR: '\x1b[?25l',
    SHOW_CURSOR: '\x1b[?25h',
    CLEAR_LINE: '\x1b[2K\r',

    // n行上に移動する文字列を取得
    GET_UP: (n) => `\x1b[${n}A`,

    // 色コードの定義
    COLOR: {
        GREEN: '\x1b[32m',
        BRIGHT_GREEN: '\x1b[92m',
        RESET: '\x1b[0m'
    },

    // 指定範囲のランダムな整数
    RANDOM: (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
};
