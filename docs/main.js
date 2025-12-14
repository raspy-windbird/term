import { TerminalApp } from './TerminalApp.js';

//ターミナルdom取得しておく
const terminalElement = document.getElementById("terminal");

if (terminalElement) {
    const app = new TerminalApp(terminalElement, "commands.yaml");
    app.init();
} else {
    console.error("Terminal DOM not found")
}