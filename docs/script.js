import * as yaml from "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js";

let commands = {};

fetch("commands.yaml")
    .then(res => res.text())
    .then(text => {
        commands = yaml.load(text);
        initTerminal();
    })
    .catch(err => {
        console.error("Failed to load YAML:", err);
    });

function initTerminal() {
    const term = new Terminal({
        cursorBlink: true,
    });
    const localEcho = new LocalEchoController(term);

    // HTML側の #terminal に描画
    term.open(document.getElementById("terminal"));

    // ローカルエコーをターミナルに登録
    term.loadAddon(localEcho);

    localEcho.println("Welcome to my terminal! Type 'help'");

    prompt();

    function prompt() {
        localEcho.read("~$ ")
            .then(input => handleCommand(localEcho, input.trim()))
            .then(prompt)
            .catch(() => prompt());
    }
}

// 入力されたコマンドを処理
function handleCommand(localEcho, input) {
    if (!input) return;

    const cmd = commands.commands[input];
    if (!cmd) {
        localEcho.println(`Command not found: ${input}`);
        return;
    }

    cmd.output.forEach(item => {
        localEcho.println(item.text);
    });
}
