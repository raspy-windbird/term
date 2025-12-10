// DOM
const connectButton = document.getElementById('connectButton');
const terminalContainer = document.getElementById('terminal');
const testEchoButton = document.getElementById('testEchoButton');
const testButton = document.getElementById('testButton');
const ClearButton = document.getElementById('clearButton');

// xterm.js の設定
const term = new Terminal({
    rows: 24,
    cols: 80,
    cursorBlink: false,
    cursorStyle: 'block',
    convertEol: true
});

// Local Echo コントローラーのインスタンス生成 (xterm.js >=v4 形式)
// LocalEchoController はグローバル変数として利用可能
const localEcho = new LocalEchoController();
term.loadAddon(localEcho);

// ターミナルを開く
term.open(terminalContainer);
term.write('Welcome to Web Serial Terminal (using global variables)\r\n');
term.write('Click "USBデバイスに接続" to begin.\r\n');

let port; // シリアルポートオブジェクト

// 接続ボタンのイベントリスナー
connectButton.addEventListener('click', async () => {
    if (!('serial' in navigator)) {
        localEcho.write('Error: Web Serial API is not supported in this browser.\r\n');
        return;
    }
    localEcho.write('接続ボタン.動作済\r\n');

    try {
        // ポート接続
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 }); 

        localEcho.write('Connected! Baud Rate: 115200.\r\n');
        localEcho.write('Type commands below and press Enter to send.\r\n');
        
        // 受信ループの開始
        readLoop();

        // 送信ループの開始
        // 公式サンプルの read() を使って、ユーザー入力を待ち受けるメインループを開始
        while (port && port.writable) {
            const input = await localEcho.read('> '); // プロンプト表示と入力待ち
            if (input) {
                const encoder = new TextEncoder();
                // 入力された文字列をデバイスに送信
                await port.writable.getWriter().write(encoder.encode(input + '\r\n'));
                console.log("Sent:", input + "\r\n");
            }
        }

    } catch (error) {
        console.error(error);
        localEcho.write(`\r\nConnection error: ${error.message}\r\n`);
    }
});

// 受信ループ関数
async function readLoop() {
    const textDecoder = new TextDecoderStream();
    port.readable.pipeThrough(textDecoder);
    const reader = textDecoder.getReader();
    
    while (true) {
        const { value, done } = await reader.read();
        if (done) { break; }
        // 受信データをターミナルに表示
        localEcho.write(value);
    }
}


// testボタンのイベントリスナー
testButton.addEventListener('click', () => {
    const testSequence = 
        "--- VT-100 Test Output ---\r\n" +
        "\x1b[31m" + "This is red text.\r\n" +
        "\x1b[32m" + "This is green text.\r\n" +
        "\x1b[0m" + "Color has been reset.\r\n";
    localEcho.write(testSequence);
});

// Clearボタンのイベントリスナー
ClearButton.addEventListener('click', () => {
    // xterm.js の clear() メソッドが使える
    term.clear(); 
});

// Echoテストボタンのイベントリスナー (公式サンプルの read() 使用)
testEchoButton.addEventListener('click', async () => {
    localEcho.write('Echo test mode activated. Type "exit" to quit.\r\n');
    while (true) {
        // キー入力が可能に・Enter待ち状態に
        const input = await localEcho.read('>TEST> '); 
        
        console.log("Echo Test Input:", input);
        
        // ループを抜ける
        if (input.toLowerCase() === 'exit') {
            localEcho.write('Exiting echo test mode.\r\n');
            break; // whileループを抜ける
        }
    }
});
