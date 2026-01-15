import { Terminal } from 'xterm';
import { Readline } from 'xterm-readline';

/** コマンドデータの構造定義 */
interface CommandData {
    [key: string]: {
        output: { text: string }[];
    };
}

export class TerminalApp {
    private readonly commands: CommandData = {
        "about": {
            "output": [{ "text": "Welcome to the Terminal" }]
        },
        "ls": {
            "output": [{ "text": "Available: about, clear, ls" }]
        }
    };

    private term: Terminal | null = null;
    private rl: Readline | null = null;
    private domElement: HTMLElement;

    constructor(domElement: HTMLElement) {
        this.domElement = domElement;
    }

    public async init(): Promise<void> {
        this.setupTerminal(this.domElement);
        if (this.term && this.rl) {
            this.term.writeln("Welcome! Type 'ls' to see commands.");
            this.runPromptLoop();
        }
    }

    // TerminalApp.ts 内の setupTerminal メソッド

    private setupTerminal(dom: HTMLElement): void {
        this.term = new Terminal({ cursorBlink: true });
        this.rl = new Readline();
        this.term.loadAddon(this.rl);
        this.term.open(dom);

        // 修正: メソッド名が 'setCompletionCallback' である可能性が高いです
        // ライブラリのバージョンによってはプロパティへの代入の場合もあります
        try {
            if (typeof (this.rl as any).setCompletionCallback === 'function') {
                this.rl.setCompletionCallback((command: string) => {
                    const candidates = [...Object.keys(this.commands), "clear"];
                    return candidates.filter(c => c.startsWith(command));
                });
            } else {
                console.warn("Readline completion callback method not found.");
            }
        } catch (e) {
            console.error("Failed to set completion callback:", e);
        }
    }

    private async runPromptLoop(): Promise<void> {
        if (!this.rl) return;
        while (true) {
            try {
                const input = await this.rl.read("~$ ");
                this.handleCommand(input.trim());
            } catch (e) {
                console.error("Readline Error:", e);
                break;
            }
        }
    }

    private handleCommand(input: string): void {
        if (!input || !this.term) return;

        switch (input) {
            case "clear":
                this.term.clear();
                return;
            case "ls":
                const list = [...Object.keys(this.commands), "clear"].sort();
                this.term.writeln("Commands: " + list.join(", "));
                return;
        }

        const cmd = this.commands[input];
        if (cmd) {
            // 'line' に型を明示し、termのnullチェックを ! で確定させる (TS2531/TS7006対策)
            cmd.output.forEach((line: { text: string }) => {
                this.term!.writeln(line.text);
            });
        } else {
            this.term.writeln(`command not found: ${input}`);
        }
    }
}
