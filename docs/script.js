// main.js

// Start an xterm.js instance
const term = new Terminal();
term.open(document.getElementById('terminal'));

// Create a local echo controller (xterm.js v3 形式を採用)
// term インスタンスを引数に渡します
const localEcho = new LocalEchoController(term);

/*
// xterm.js >=v4 の場合はこちらを使いますが、
// 現在のエラー状況では v3 形式 (上記) が動作する可能性が高いです。
const localEcho_v4 = new LocalEchoController();
term.loadAddon(localEcho_v4);
*/


// Read a single line from the user
localEcho.read("~$ ")
    .then(input => alert(`User entered: ${input}`))
    .catch(error => alert(`Error reading: ${error}`));

// ターミナル起動時のメッセージなどを追加したい場合はここ
localEcho.println("Terminal is ready. Enter input at the prompt.");
