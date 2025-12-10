let commands = {};
let term;
let localEcho;

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

    localEcho.println("Welcome to my terminal! Type 'help'");

    prompt();

    let historyIndex = -1;

    term.onKey(e => {
        const ev = e.domEvent;

        if (ev.key === "ArrowUp") {
            if (localEcho._history && localEcho._history.length > 0) {
                if (historyIndex === -1)
                    historyIndex = localEcho._history.length - 1;
                else if (historyIndex > 0)
                    historyIndex--;
                localEcho.setInput(localEcho._history[historyIndex]);
            }
            ev.preventDefault();
        }

        if (ev.key === "ArrowDown") {
            if (localEcho._history && localEcho._history.length > 0) {
                if (historyIndex < localEcho._history.length - 1) {
                    historyIndex++;
                    localEcho.setInput(localEcho._history[historyIndex]);
                } else {
                    historyIndex = -1;
                    localEcho.setInput("");
                }
            }
            ev.preventDefault();
        }
    });
}

function prompt() {
    localEcho.read("~$ ")
        .then(input => handleCommand(input.trim()))
        .then(prompt)
        .catch(() => prompt());
}

function handleCommand(input) {
    if (input) {
        localEcho._history = localEcho._history || [];
        localEcho._history.push(input);
    } else return;

    // === 内部コマンド ===
    if (input === "help") {
        localEcho.println("Available commands:");

        Object.keys(commands.commands).forEach(cmd => {
            const desc = commands.commands[cmd].desc || "";
            localEcho.println(` - ${cmd} ${desc ? "— " + desc : ""}`);
        });
        localEcho.println(" - clear — Clear the screen");
        localEcho.println(" - history — Show command history");
        localEcho.println(" - ls — List commands");
        return;
    }

    if (input === "clear") {
        term.reset();
        return;
    }

    if (input === "history") {
        localEcho.println("History:");
        if (!localEcho._history || localEcho._history.length === 0) {
            localEcho.println(" (empty)");
        } else {
            localEcho._history.forEach(h => localEcho.println(" " + h));
        }
        return;
    }

    if (input === "ls") {
        localEcho.println("Commands:");
        Object.keys(commands.commands).forEach(cmd => {
            localEcho.println(" " + cmd);
        });
        localEcho.println(" help  clear  history");
        return;
    }

    // === YAMLコマンド ===
    const cmd = commands.commands[input];
    if (!cmd) {
        localEcho.println(`Command not found: ${input}`);
        return;
    }

    cmd.output.forEach(item => {
        localEcho.println(item.text);
    });
}
