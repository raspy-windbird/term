import { Utils as UTILS } from './Utils.js';

export class DigitalFall {
    /**
     * @param {Terminal} term - xterm.js インスタンス
     * @param {object} options - 期間(ms)や行数
     */
    constructor(term, options = {}) {
        this.term = term;
        this.duration = options.duration || 3000; // 3秒
        this.rowCount = options.rowCount || 5;   // 10行分を使用

        this.keywords = ["infinity", "github"];
        this.errorMark = "ERROR";
    }

    /**
     * エフェクトを実行　約12fps
     * @returns {Promise<void>}
     */
    async execute() {
        this.term.write(UTILS.HIDE_CURSOR);

        // 描画領域を確保
        for (let i = 0; i < this.rowCount; i++) this.term.writeln('');

        const startTime = Date.now();

        return new Promise((resolve) => {
            const timer = setInterval(() => {
                const elapsed = Date.now() - startTime;

                if (elapsed > this.duration) {
                    clearInterval(timer);
                    this.term.write(UTILS.GET_UP(this.rowCount));

                    // 全行をクリアする
                    for (let i = 0; i < this.rowCount; i++) {
                        this.term.write(UTILS.CLEAR_LINE);
                        // 次の行のクリアへ進む
                        if (i < this.rowCount - 1) this.term.write('\n');
                    }

                    // 領域の先頭まで戻る
                    this.term.write(UTILS.GET_UP(this.rowCount - 1));

                    // [Complete] メッセージ
                    const completeMsg = `${UTILS.COLOR.BRIGHT_GREEN}[Complete]${UTILS.COLOR.RESET} System analysis stream finished.`;
                    this.term.writeln(completeMsg);
                    // --- クリーンアップ終了 ---

                    this.term.write(UTILS.SHOW_CURSOR);
                    resolve();
                } else {
                    this.renderFrame();
                }
            }, 80);
        });
    }

    /**
     * 1フレームの描画処理
     */
    renderFrame() {
        // 一番下から上に戻って描画
        this.term.write(UTILS.GET_UP(this.rowCount));

        for (let i = 0; i < this.rowCount; i++) {
            this.term.write(UTILS.CLEAR_LINE);
            const line = this.createFrameLine();
            this.term.writeln(line);
        }
    }

    /**
     * バイナリ・ストリーム行の生成
     */
    createFrameLine() {
        const width = this.term.cols || 80;
        let line = "";
        let i = 0;

        while (i < width) {
            const rand = Math.random();

            //　0.5%でキーワード
            if (rand < 0.005) {
                const word = this.keywords[UTILS.RANDOM(0, this.keywords.length - 1)];
                line += `${UTILS.COLOR.BRIGHT_GREEN}${word}${UTILS.COLOR.RESET}`;
                i += word.length;
            }
            //  0.3%でERROR
            else if (rand < 0.008) {
                line += `${UTILS.COLOR.RED}${this.errorMark}${UTILS.COLOR.RESET}`;
                i += this.errorMark.length;
            }
            //  15%でバイナリ
            else if (rand < 0.15) {
                const bit = Math.random() > 0.5 ? "1" : "0";
                // 1:明 0:暗　色分け
                const color = bit === "1" ? UTILS.COLOR.GREEN : UTILS.COLOR.DARK_GREEN;
                line += `${color}${bit}${UTILS.COLOR.RESET}`;
                i++;
            }
            // 空白
            else {
                line += " ";
                i++;
            }
        }
        return line;
    }
}
