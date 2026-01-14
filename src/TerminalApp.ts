/// <reference path="./types/global.d.ts" />
import { Terminal } from 'xterm';
import { DigitalFall } from './effects/DigitalFall';
import { EffectConstructor } from './types/IEffect';
import { FitAddon } from 'xterm-addon-fit';
import { CanvasAddon } from 'xterm-addon-canvas';

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

    constructor(private domElement: HTMLElement) { }

    public async init(): Promise<void> {
        try {
            // 1. インスタンス作成
            this.term = new Terminal({
                cursorBlink: true,
                lineHeight: 1.4,
                theme: { background: '#1a1a1a' },
                screenReaderMode: false,
                scrollback: 0,
            });

            // 2. DOMにマウント
            this.term.open(this.domElement);

            if (typeof (this.term as any).on !== 'function') {
                (this.term as any).on = (name: string, callback: Function) => {
                    // 'data' イベントを直接 term.onData に結びつけ、
                    // かつ余計な内部処理を介さないようにする
                    if (name === 'data') return this.term!.onData(e => callback(e));
                    if (name === 'resize') return this.term!.onResize(e => callback(e));
                };
            }

            // 4. 【重要】xterm.jsの内部状態（colors）が安定するのを待つ
            // これを入れないと CanvasAddon が "reading colors" で落ちます
            await new Promise(r => setTimeout(r, 100));

            // 5. 【重要】local-echoが内部で使うグローバル変数をここでセット
            // これを入れないと文字入力時に ReferenceError になります
            (window as any).term = this.term;

            // 6. アドオンのロード
            const fit = new FitAddon();
            const canvas = new CanvasAddon();
            this.term.loadAddon(fit);
            try {
                this.term.loadAddon(canvas);
            } catch (e) {
                console.warn("CanvasAddon failed, using DOM renderer:", e);
            }

            // 7. レイアウト確定
            fit.fit();
            window.onresize = () => fit.fit();

            // 8. 最後に LocalEcho を作成して開始
            this.localEcho = new LocalEchoController(this.term);
            this.localEcho.println("System online. Type 'ls' to start.");

            this.startLoop();

        } catch (e) {
            console.error(`Init Error: ${e}`);
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
