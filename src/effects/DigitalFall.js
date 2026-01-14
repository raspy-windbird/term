import { UTILS } from './Utils.js';

/** @type {object} デフォルト設定 */
const DEFAULT_CONFIG = {
    duration: 3000,
    keywords: ["infinity", "github"],
    errorMark: "ERROR",
    fps: 60
};

export class DigitalFall {
    constructor(term, options = {}) {
        this.term = term;
        this.config = { ...DEFAULT_CONFIG, ...options };
    }

    async execute() {
        // 1. 別画面へ切り替え、カーソルを隠し、画面を清掃
        this.term.write(UTILS.ENTER_ALT_SCREEN + UTILS.HIDE_CURSOR + UTILS.CLEAR_SCREEN);

        const startTime = Date.now();

        return new Promise((resolve) => {
            const timer = setInterval(() => {
                const elapsed = Date.now() - startTime;

                if (elapsed > this.config.duration) {
                    clearInterval(timer);
                    this.finalize().then(resolve);
                } else {
                    this.renderFrame();
                }
            }, this.config.fps);
        });
    }

    /** 全画面をバイナリで埋め尽くす */
    renderFrame() {
        // 画面左上(Home)に戻る
        this.term.write('\x1b[H');

        const rows = this.term.rows || 24;
        for (let i = 0; i < rows; i++) {
            this.term.write(UTILS.CLEAR_LINE);
            this.term.writeln(this.createFrameLine());
        }
    }

    createFrameLine() {
        const width = this.term.cols || 80;
        let line = "";
        let i = 0;

        while (i < width) {
            const rand = Math.random();
            if (rand < 0.005) {
                const word = this.config.keywords[UTILS.RANDOM(0, this.config.keywords.length - 1)];
                line += `${UTILS.COLOR.BRIGHT_GREEN}${word}${UTILS.COLOR.RESET}`;
                i += word.length;
            } else if (rand < 0.008) {
                // 【修正済み】config.config のタイポを解消
                line += `${UTILS.COLOR.RED}${this.config.errorMark}${UTILS.COLOR.RESET}`;
                i += this.config.errorMark.length;
            } else if (rand < 0.2) { // 密度を少し上げた
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

    async finalize() {
        // 2. 元の画面へ戻る（これによりアニメーション前の履歴が復活する）
        this.term.write(UTILS.EXIT_ALT_SCREEN + UTILS.SHOW_CURSOR);

        // 3. 戻った直後の行に結果を刻む
        const msg = `${UTILS.COLOR.BRIGHT_GREEN}[Complete]${UTILS.COLOR.RESET} Binary stream analysis finished.`;
        this.term.writeln(msg);
    }
}
