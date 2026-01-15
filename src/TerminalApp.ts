import { Terminal } from 'xterm';
import { Readline } from 'xterm-readline';

export class TerminalApp {
    private readonly commands: CommandData = {
        "about": {
            "output": [
                { "text": "Terminal Portfolio v1.0.0" },
                { "text": "Running on xterm.js with xterm-readline." }
            ]
        },
        "contact": {
            "output": [
                { "text": "Email: example@example.com" },
                { "text": "GitHub: github.com" }
            ]
        }
    };

    private term: Terminal | null = null;
    private rl: Readline | null = null;
    private domElement: HTMLElement;

    constructor(domElement: HTMLElement) {
        this.domElement = domElement;
    }

    /** 初期化 */
    public async init(): Promise<void> {
        this.setupTerminal(this.domElement);

        if (this.term && this.rl) {
            this.term.writeln("Welcome! Type 'ls' to see available commands.");
            // 非同期ループを開始
            this.runPromptLoop();
        }
    }

    /** ターミナルのセットアップ */
    private setupTerminal(dom: HTMLElement): void {
        this.term = new Terminal({
            cursorBlink: true,
            lineHeight: 1.4,
            theme: {
                background: '#1a1b26',
                foreground: '#c0caf5'
            }
        });

        this.rl = new Readline();
        this.term.loadAddon(this.rl);
        this.term.open(dom);

        // タブ補完の設定
        this.rl.setCheckCompletionCallback((command) => {
            const candidates = [...Object.keys(this.commands), "ls", "clear"];
            return candidates.filter(c => c.startsWith(command));
        });
    }

    /** メインループ */
    private async runPromptLoop(): Promise<void> {
        if (!this.rl) return;

        while (true) {
            try {
                // プロンプトを表示して入力を待機
                const input = await this.rl.read("~$ ");
                this.handleCommand(input.trim());
            } catch (e) {
                console.error("Terminal Read Error:", e);
            }
        }
    }

    /** コマンド判定ロジック */
    private handleCommand(input: string): void {
        if (!input || !this.term) return;

        // 1. 組み込みコマンドの処理
        switch (input) {
            case "clear":
                this.term.clear();
                return;

            case "ls":
                const all = [...Object.keys(this.commands), "clear", "ls"].sort();
                this.term.writeln("Available commands:");
                all.forEach(c => this.term.writeln(`  ${c}`));
                return;
        }

        // 2. JSONデータからの検索
        const cmd = this.commands[input];
        if (cmd) {
            cmd.output.forEach(line => this.term?.writeln(line.text));
        } else {
            this.term.writeln(`command not found: ${input}`);
        }
    }
}
