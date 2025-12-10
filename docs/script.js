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

    prompt();
}

function prompt() {
    localEcho.read("~$ ")
        .then(input => handleCommand(localEcho, input.trim()))
        .then(prompt)
        .catch(() => prompt());
}

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
