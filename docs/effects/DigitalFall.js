import { UTILS } from './Utils.js';

/**
 * @typedef {Object} DigitalFallConfig
 * @property {number} duration - アニメーション継続時間 (ms)
 * @property {number} rowCount - 描画に使用する行数
 * @property {string[]} keywords - 注入するキーワード
 * @property {string} errorMark - エラー時に表示する文字列
 * @property {number} fps - フレームレート(ミリ秒)
 */

/** @type {DigitalFallConfig} デフォルト設定 */
const DEFAULT_CONFIG = {
    duration: 3000,
    rowCount: 10,
    keywords: ["infinity", "github"],
    errorMark: "ERROR",
    fps: 80
};

export class DigitalFall {
    /**
     * @param {any} term - xterm.js Terminal インスタンス
     * @param {Partial<DigitalFallConfig>} [options] - エフェクト設定（デフォルトを上書き）
     */
    constructor(term, options = {}) {
        this.term = term;
        // デフォルト値とオプションをマージ
        /** @type {DigitalFallConfig} */
        this.config = { ...DEFAULT_CONFIG, ...options };
    }

    async execute() {
        this.term.write(UTILS.HIDE_CURSOR);

        for (let i = 0; i < this.config.rowCount; i++) this.term.writeln('');

        const startTime = Date.now();

        return new Promise((resolve) => {
            const timer = setInterval(async () => {
                const elapsed = Date.now() - startTime;

                if (elapsed > this.config.duration) {
                    clearInterval(timer);
                    await this.finalize();
                    resolve();
                } else {
                    this.renderFrame();
                }
            }, this.config.fps); // マジックナンバーを排除
        });
    }

    /** @private */
    renderFrame() {
        this.term.write(UTILS.GET_UP(this.config.rowCount));
        for (let i = 0; i < this.config.rowCount; i++) {
            this.term.write(UTILS.CLEAR_LINE);
            this.term.writeln(this.createFrameLine());
        }
    }

    /** @private */
    createFrameLine() {
        const width = this.term.cols || 80;
        let line = "";
        let i = 0;

        while (i < width) {
            const rand = Math.random();
            // configから参照
            if (rand < 0.005) {
                const word = this.config.keywords[UTILS.RANDOM(0, this.config.keywords.length - 1)];
                line += `${UTILS.COLOR.BRIGHT_GREEN}${word}${UTILS.COLOR.RESET}`;
                i += word.length;
            } else if (rand < 0.008) {
                line += `${UTILS.COLOR.RED}${this.config.config.errorMark}${UTILS.COLOR.RESET}`;
                i += this.config.errorMark.length;
            } else if (rand < 0.15) {
                const bit = Math.random() > 0.5 ? "1" : "0";
                const color = bit === "1" ? UTILS.COLOR.GREEN : UTILS.COLOR.DARK_GREEN;
                line += `${color}${bit}${UTILS.COLOR.RESET}`;
                i++;
            } else {
                line += " ";
                i++;
            }
        }
        return line;
    }

    /** @private */
    async finalize() {
        const { rowCount } = this.config;
        this.term.write(UTILS.GET_UP(rowCount));
        for (let i = 0; i < rowCount; i++) {
            this.term.write(UTILS.CLEAR_LINE);
            if (i < rowCount - 1) this.term.write('\n');
        }
        this.term.write(UTILS.GET_UP(rowCount - 1));

        const msg = `${UTILS.COLOR.BRIGHT_GREEN}[Complete]${UTILS.COLOR.RESET} Binary stream analysis finished.`;
        this.term.writeln(msg);
        this.term.write(UTILS.SHOW_CURSOR);
    }
}
