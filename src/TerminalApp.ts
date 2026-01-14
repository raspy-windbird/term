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
            // 1. ターミナルの準備とサイズ確定 (fit) を先に行う
            this.setupTerminal();

            // 2. DOMに反映されるまで僅かに待機（ブラウザの計算時間を待つ）
            await new Promise(resolve => setTimeout(resolve, 50));

            // 3. サイズが確定したターミナルに対して、LocalEchoを作成する
            if (this.term) {
                this.localEcho = new LocalEchoController(this.term);
                this.localEcho.println("Welcome. Type 'ls' to see available commands.");

                // 入力ループ開始
                this.startLoop();
            }
        } catch (e) {
            console.error(`Init Error: ${e}`);
        }
    }

    private setupTerminal(): void {
        this.term = new Terminal({
            cursorBlink: true,
            lineHeight: 1.4,
            theme: { background: '#1a1a1a' },
            screenReaderMode: false // ジャンプ防止に必須
        });

        // 1. まず open する（これより前に CanvasAddon をロードしてはいけない）
        this.term.open(this.domElement);

        // 2. open した後にアドオンをロードする
        const fitAddon = new FitAddon();
        const canvasAddon = new CanvasAddon();

        this.term.loadAddon(fitAddon);

        try {
            // open 後なので、今度は成功します
            this.term.loadAddon(canvasAddon);
        } catch (e) {
            console.error("CanvasAddon load error:", e);
        }

        // 3. local-echo 用のパッチを当てる
        if (typeof (this.term as any).on !== 'function') {
            (this.term as any).on = (name: string, callback: Function) => {
                if (name === 'data') return this.term!.onData(data => callback(data));
                if (name === 'resize') return this.term!.onResize(size => callback(size));
            };
        }
        
        fitAddon.fit();

        window.addEventListener('resize', () => fitAddon.fit());
        (window as any).term = this.term;
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
