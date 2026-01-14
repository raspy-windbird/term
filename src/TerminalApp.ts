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
            // 1. ターミナルの基本セットアップを実行
            this.setupTerminal();

            if (this.term) {
                // 2. local-echo が内部で参照するグローバル変数を即座にセット
                (window as any).term = this.term;

                // 3. LocalEcho インスタンスを作成
                this.localEcho = new LocalEchoController(this.term);
                this.localEcho.println("Welcome. Type 'ls' to see available commands.");

                // 4. 入力ループ開始
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
            screenReaderMode: false
        });

        // 2. ターミナルをDOMに展開（アドオンのロードなし）
        this.term.open(this.domElement);

        // 3. local-echo.js が内部で .on('data') を呼べるようにする最小限のパッチ
        if (typeof (this.term as any).on !== 'function') {
            (this.term as any).on = (name: string, callback: Function) => {
                if (name === 'data') return this.term!.onData(data => callback(data));
                if (name === 'resize') return this.term!.onResize(size => callback(size));
            };
        }
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
