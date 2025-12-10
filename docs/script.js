const term = new Terminal();
term.open(document.getElementById('terminal'));

const localEcho = new LocalEchoController(term);
localEcho.println("Terminal is ready. Waiting for input:");

localEcho.read("~$ ")
    .then(input => {
        term.writeln('You typed: ' + input);
    })
    .catch(err => {
        term.writeln('Error: ' + err);
    });
