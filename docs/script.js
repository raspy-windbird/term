let commands = {};
let term;
let localEcho;

// YAML読み込み
fetch("commands.yaml")
    .then(res => res.text())
    .then(text => {
        commands = jsyaml.load(text);
        initTerminal();
    })
    .catch(err => {
        console.error("Failed to load YAML:", err);
    });

function initTerminal() {
    term = new Terminal({
        cursorBlink: true,
    });
    localEcho = new LocalEchoController(term);

    term.open(document.getElementById("terminal"));

    // 履歴管理
    localEcho._history = [];

    localEcho.println("Welcome to my terminal! Type 'ls' to see commands");
    showPrompt();

    // 履歴対応 ↑↓
    let historyIndex = -1;
    term.onKey(e => {
        const ev = e.domEvent;

        if (ev.key === "ArrowUp") {
            if (localEcho._history.length > 0) {
                if (historyIndex === -1) historyIndex = localEcho._history.length - 1;
                else if (historyIndex > 0) historyIndex--;
                localEcho.setInput(localEcho._history[historyIndex]);
            }
            ev.preventDefault();
        }

        if (ev.key === "ArrowDown") {
            if (localEcho._history.length > 0) {
                if (historyIndex < localEcho._history.length - 1) historyIndex++;
                else historyIndex = -1;

                localEcho.setInput(historyIndex === -1 ? "" : localEcho._history[historyIndex]);
            }
            ev.preventDefault();
        }
    });
}

function showPrompt() {
    localEcho.read("~$ ")
        .then(input => handleCommand(input.trim()))
        .then(showPrompt)
        .catch(showPrompt);
}

function handleCommand(input) {
    if (!input) return;

    localEcho._history.push(input);

    // built-in commands
    switch (input) {
        case "clear":
            term.reset();
            return;

        case "history":
            localEcho.println("History:");
            localEcho._history.forEach((h, i) => localEcho.println(` ${i + 1}: ${h}`));
            showPrompt();
            return;

        case "ls":
            // まとめて文字列で出力
            let allCmds = [...Object.keys(commands.commands), "clear", "history"];
            let output = "Commands:\r\n" + allCmds.map(c => " " + c).join("\r\n") + "\r\n";

            // read() を呼ばずに term.write で出力
            term.write(output);

            return;

    }

    // YAMLコマンド
    const cmd = commands.commands[input];
    if (!cmd) {
        localEcho.println(`Command not found: ${input}`);
        return;
    }

    (cmd.output || []).forEach(item => localEcho.println(item.text));
}
