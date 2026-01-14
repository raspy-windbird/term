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
                screenReaderMode: false
            });

            // 2. DOMにマウント
            this.term.open(this.domElement);

            // 3. 【新】パッチ処理をその場で行う (applyLegacyPatchを呼ばない)
            if (typeof (this.term as any).on !== 'function') {
                (this.term as any).on = (name: string, callback: Function) => {
                    if (name === 'data') return this.term!.onData(data => callback(data));
                    if (name === 'resize') return this.term!.onResize(size => callback(size));
                };
            }

            // 4. 【新・解決策】xterm.jsの「書き込み可能」を待ってからアドオンをロード
            // これにより 'colors' 未定義エラーを物理的に回避します
            await new Promise(r => setTimeout(r, 50));

            const fit = new FitAddon();
            const canvas = new CanvasAddon();

            this.term.loadAddon(fit);
            try {
                this.term.loadAddon(canvas);
            } catch (e) {
                console.warn("CanvasAddon error (fallback to DOM):", e);
            }

            fit.fit();
            window.onresize = () => fit.fit();

            // 5. 全てが整った後に LocalEcho を作成
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
