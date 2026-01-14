import { Terminal } from 'xterm';
import { UTILS } from '../Utils';
import { IEffect, EffectConfig } from '../types/IEffect';

/** バイナリフォール専用の設定型 */
interface DigitalFallConfig extends EffectConfig {
    keywords: string[];
    errorMark: string;
}

const DEFAULT_CONFIG: DigitalFallConfig = {
    duration: 3000,
    fps: 60,
    keywords: ["infinity", "github"],
    errorMark: "ERROR"
};

export class DigitalFall implements IEffect {
    private config: DigitalFallConfig;

    constructor(
        private term: Terminal,
        options: Partial<DigitalFallConfig> = {}
    ) {
        this.config = { ...DEFAULT_CONFIG, ...options };
    }

    /**
     * エフェクトの実行
     * Promise<void> を明示的に返す
     */
    public async execute(): Promise<void> {
        this.term.write(UTILS.ENTER_ALT_SCREEN + UTILS.HIDE_CURSOR + UTILS.CLEAR_SCREEN);

        const startTime = Date.now();

        // <void> を明示して unknown 型エラーを回避
        return new Promise<void>((resolve) => {
            const timer = setInterval(async () => {
                const elapsed = Date.now() - startTime;

                if (elapsed > (this.config.duration || 3000)) {
                    clearInterval(timer);
                    await this.finalize();
                    resolve(); // void で解決
                } else {
                    this.renderFrame();
                }
            }, this.config.fps);
        });
    }

    private renderFrame(): void {
        this.term.write('\x1b[H');
        const rows = this.term.rows || 24;
        for (let i = 0; i < rows; i++) {
            this.term.write(UTILS.CLEAR_LINE);
            this.term.writeln(this.createFrameLine());
        }
    }

    private createFrameLine(): string {
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
                line += `${UTILS.COLOR.RED}${this.config.errorMark}${UTILS.COLOR.RESET}`;
                i += this.config.errorMark.length;
            } else if (rand < 0.2) {
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

    private async finalize(): Promise<void> {
        this.term.write(UTILS.EXIT_ALT_SCREEN + UTILS.SHOW_CURSOR);
        const msg = `${UTILS.COLOR.BRIGHT_GREEN}[Complete]${UTILS.COLOR.RESET} Binary stream analysis finished.`;
        this.term.writeln(msg);
    }
}
