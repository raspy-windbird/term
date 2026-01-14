import 'xterm/css/xterm.css';
import { TerminalApp } from './TerminalApp';

/**
 * ターミナルのエントリーポイント
 */
const terminalElement = document.getElementById("terminal");

if (terminalElement) {
    const app = new TerminalApp(terminalElement);

    app.init().catch(err => {
        console.error("Terminal initialization failed:", err);
    });
} else {
    console.error("Terminal DOM not found");
}
