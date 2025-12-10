// Start an xterm.js instance
const term = new Terminal();
term.open(document.getElementById('terminal'));

term.on('ready', () => {
    localEcho.println("Terminal is ready. Waiting for input:");

    // Read a single line from the user
    localEcho.read("~$ ")
        .then(input => alert(`User entered: ${input}`))
        .catch(error => alert(`Error reading: ${error}`));
});

const localEcho = new LocalEchoController(term);
