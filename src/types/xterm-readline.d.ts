declare module 'xterm-readline' {
    import { ITerminalAddon, Terminal } from 'xterm';
    export class Readline implements ITerminalAddon {
        activate(terminal: Terminal): void;
        dispose(): void;
        read(prompt: string): Promise<string>;
        setCompletionCallback(callback: (command: string) => string[]): void;
    }
}
