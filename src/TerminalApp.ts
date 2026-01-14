/// <reference path="./types/global.d.ts" />
import { Terminal } from 'xterm';
import { DigitalFall } from './effects/DigitalFall';
import { EffectConstructor } from './types/IEffect';

interface StaticCommand {
    output: string[];
}

export class TerminalApp {
    private readonly EFFECT_MAP: Record<string, EffectConstructor> = {
        'matrix': DigitalFall,
    };

    private readonly commands: Record<string, StaticCommand> = {
        "about": { output: ["Terminal Portfolio v2.0", "Full TypeScript Edition 2026."] },
        "contact": { output: ["GitHub: github.com"] }
    };

    private term: Terminal | null = null;
    private localEcho: InstanceType<typeof LocalEchoController> | null = null;

    constructor(private domElement: HTMLElement) {}

    /**
 * アプリケーションの初期化
 * 順序を直列（シンプル）に戻し、余計な待機を排除します
 */
    public async init(): Promise<void> {
        try {
            this.setupTerminal();

            // 1. 【重要】ブラウザにDOMの幅計算（レンダリング）を完了させるための十分な待ち時間
            // 2026年現在のブラウザの安定性を考慮し、100ms 待ちます
            await new Promise(resolve => setTimeout(resolve, 100));

            if (this.term) {
                // 2. 【重要】local-echo を作る「直前」に、強制的にサイズをセット
                // これにより local-echo が「幅0」と勘違いするのを防ぎます
                this.term.resize(80, 24);

                (window as any).term = this.term;

                // 3. サイズが確定(80列)した状態で作成
                this.localEcho = new LocalEchoController(this.term);
                this.localEcho.println("System online. Ready.");
                this.startLoop();
            }
        } catch (e) {
            console.error(`Init Error: ${e}`);
        }
    }

    /**
     * ターミナルのセットアップ
     * アドオンをすべて排除し、初期のJS版に近い「標準DOM描画」に戻します
     */
    private setupTerminal(): void {
        // 1. アドオンなしの純粋なインスタンス生成
        // cols, rows を明示的に指定してサイズ計算のズレを抑止します
        this.term = new Terminal({
            cursorBlink: true,
            lineHeight: 1.4,
            theme: { background: '#1a1a1a' },
            cols: 80,
            rows: 24,
            screenReaderMode: false,
            linkHandler: null,
        });

        const originalWrite = this.term.write.bind(this.term);
        this.term.write = (data: string | Uint8Array, cb?: () => void) => {
            originalWrite(data, cb);
            // 書き込み直後に内部のレンダラーを強制キックする (v5特有の非公開API)
            (this.term as any)._core._renderService.onRender.fire();
        };

        // 2. ターミナルをDOMに展開（アドオンのロードなし）
        this.term.open(this.domElement);
    }

    private async startLoop(): Promise<void> {
        if (!this.localEcho) return;

        while (true) {
            try {
                const input = await this.localEcho.read("~$ ");
                const trimmedInput = input.trim();
                if (trimmedInput) {
                    await this.handleCommand(trimmedInput);
                }
            } catch (e) {
                console.warn("Input interrupted:", e);
            }
        }
    }

    private async handleCommand(input: string): Promise<void> {
        if (!this.term || !this.localEcho) return;

        const EffectClass = this.EFFECT_MAP[input];
        if (EffectClass) {
            const effect = new EffectClass(this.term, { duration: 4000 });
            await effect.execute();
            return;
        }

        switch (input) {
            case "clear":
                this.term.clear();
                return;
            case "ls":
                const all = [...Object.keys(this.commands), ...Object.keys(this.EFFECT_MAP), "clear", "ls"].sort();
                this.localEcho.println(all.join("  "));
                return;
        }

        const cmd = this.commands[input];
        if (cmd) {
            cmd.output.forEach(line => this.localEcho!.println(line));
        } else {
            this.localEcho.println(`command not found: ${input}`);
        }
    }
}
