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

    // 履歴 ON（historyEnable は v3 には存在しないので、自前で管理）
    localEcho._history = [];

    // 📌 コマンドをここで登録する
    registerBuiltinCommands();

    localEcho.println("Welcome to my terminal! Type 'help'");
    showPrompt();
}

function showPrompt() {
    localEcho.read("~$ ")
        .then(input => handleCommand(input.trim()))
        .then(showPrompt)
        .catch(showPrompt);
}

function handleCommand(input) {
    if (!input) return;

    localEcho._history = localEcho._history || [];
    localEcho._history.push(input);

    // built-in commands
    switch (input) {
        case "clear":
            term.reset();
            showPrompt();
            return;
        case "history":
            (localEcho._history || []).forEach((h, i) =>
                localEcho.println(`${i + 1}: ${h}`)
            );
            showPrompt();
            return;
        case "ls":
            localEcho.println("Commands:");
            Object.keys(commands.commands).forEach(cmd => localEcho.println(" " + cmd));
            localEcho.println(" help  clear  history");
            showPrompt();
            return;
        case "help":
            localEcho.println("Available commands:");
            Object.keys(commands.commands).forEach(cmd =>
                localEcho.println(` - ${cmd}`)
            );
            localEcho.println(" help  clear  history");
            showPrompt();
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


function registerBuiltinCommands() {

    // === ls ===
    localEcho.addCommand("ls", async () => {
        term.write("\r\nCommands:\r\n");

        // localEchoに登録されたコマンド＋YAML側のコマンドを結合
        const builtin = Object.keys(localEcho._commands);
        const yamlCmds = Object.keys(commands.commands);
        const all = [...new Set([...builtin, ...yamlCmds])].sort();

        all.forEach(cmd => {
            term.write(` ${cmd}\r\n`);
        });

        showPrompt();
    });

    // === clear ===
    localEcho.addCommand("clear", async () => {
        term.clear();
        showPrompt();
    });

    // === history ===
    localEcho.addCommand("history", async () => {
        const hist = localEcho._history || [];
        hist.forEach((h, i) => term.write(`${i + 1}: ${h}\r\n`));
        showPrompt();
    });

    // === help（自動生成）===
    localEcho.addCommand("help", async () => {
        term.write("\r\nAvailable commands:\r\n");

        const builtin = Object.keys(localEcho._commands);
        const yamlCmds = Object.keys(commands.commands);
        const all = [...new Set([...builtin, ...yamlCmds])].sort();

        all.forEach(cmd => {
            term.write(` - ${cmd}\r\n`);
        });

        showPrompt();
    });
}
