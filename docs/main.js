import { TerminalApp } from './TerminalApp.js';

document.addEventListener('DOMContentLoaded', () => {
    //ターミナルdom取得しておく
    const terminalElement = document.getElementById("terminal");

    if (terminalElement) {
        const app = new TerminalApp(terminalElement, "commands.yaml");
        app.init();

        window.term = app.term;
    } else {
        console.error("Terminal DOM not found")
    }

});
