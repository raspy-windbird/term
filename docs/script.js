// Start an xterm.js instance
const term = new Terminal();
term.open(document.getElementById('terminal'));

// term インスタンスを引数に渡します
const localEcho = new LocalEchoController(term);

term.on('ready', () => {
    localEcho.println("Terminal is ready. Waiting for input:");

    // Read a single line from the user
    localEcho.read("~$ ")
        .then(input => alert(`User entered: ${input}`))
        .catch(error => alert(`Error reading: ${error}`));
});
// ターミナル起動時のメッセージなどを追加したい場合はここ
localEcho.println("Terminal is ready. Enter input at the prompt.");
