let commands = {};
let term;          // ←ここで宣言
let localEcho;     // ←これも外に出すと便利

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

    prompt();
}

function prompt() {
    localEcho.read("~$ ")
        .then(input => handleCommand(localEcho, input.trim()))
        .then(prompt)
        .catch(() => prompt());
}

function handleCommand(localEcho, input) {
    if (input) {
        localEcho._history = localEcho._history || [];
        localEcho._history.push(input);
    } else { return; }

    if (input === "help") {
        localEcho.println("Available commands:");

        Object.keys(commands.commands).forEach(cmd => {
            const desc = commands.commands[cmd].desc || "";
            localEcho.println(` - ${cmd} ${desc ? "— " + desc : ""}`);
        });
        return;
    }

    const cmd = commands.commands[input];
    if (!cmd) {
        localEcho.println(`Command not found: ${input}`);
        return;
    }

    cmd.output.forEach(item => {
        localEcho.println(item.text);
    });
}
