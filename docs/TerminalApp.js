/**
 * ターミナルのメインモジュール
 * @module
 */
export class TerminalApp {
    /** @type {object} YAML構造を宣言しておくやつ */
    yamlConfig = {
        topKey: "commands",
        outKey: "output"
    };

    /** @type {object} 取得したyamlコマンド */
    commands = {};

    /** @type {Terminal | null} ターミナルインスタンス */
    term = null;

    /** @type {LocalEchoController | null} local-echoの制御用インスタンス */
    localEcho = null;

    /** @type {number} 履歴用インデックス（-1は最新のもの） */
    historyIndex = -1;

    /**
     * ターミナルプロパティを作成
     * @param {HTMLElement} domElement - ターミナル表示用のDOM
     * @param {string} commandsPath - コマンド読み込み元
     */
    constructor(domElement, commandsPath) {
        this.domElement = domElement;
        this.commandsPath = commandsPath;
    }

    /**
     * アプリ初期化
     * @async
     * @returns {Promise<void>}
    **/
    async init() {
        try {
            await this.loadCommands(this.commandsPath);

            this.setupTerminal(this.domElement);

            this.localEcho.println("Welcome to my terminal! Type 'ls' to see commands");
            this.showPrompt();
        } catch (e) {
            console.error(`Init:${e}`);
            if (this.term) {
                this.term.writeln("Failed to build term.");
            } else {
                console.error("Terminal not activate.");
            }
        }
    }

    /**
     * yamlを読み込んで this.commandsに格納
     * @async
     * @param {string} g commands.yamlへの
     * @returns {Promise<void>}
     */
    async loadCommands(g) {
        try {
            const res = await fetch(g);
            const text = await res.text();
            const rawYaml = jsyaml.load(text);
            // jsyaml ライブラリがグローバルにあることが必要
            this.commands = rawYaml[this.yamlConfig.topKey];

        } catch (e) {
            console.error(`LoadCommands:${e}`)
        }
    }

    /**
     * xterm.js・local-echoのインスタンス作成→DOMに設置
     * @param {HTMLElement} dom
     * @returns {void}
     */
    setupTerminal(dom) {
        this.term = new Terminal({
            cursorBlink: true,
            lineHeight: 1.4,
        });
        this.localEcho = new LocalEchoController(this.term);
        this.term.open(dom);
        // 履歴管理の初期化
        this.localEcho._history = [];

        // 履歴対応のイベントリスナー設定
        this.term.onKey(e => this.handleKey(e));
        if (typeof window !== 'undefined') {
            window.term = this.term;
        }
    }

    /**
     * historyコマンドの動作制御
     * @param {KeyboardEvent} e イベント
     * @returns {void}
     */
    handleKey(e) {
        const ev = e.domEvent;

        if (ev.key === "ArrowUp") {
            if (this.localEcho._history.length > 0) {
                if (this.historyIndex === -1) this.historyIndex = this.localEcho._history.length - 1;
                else if (this.historyIndex > 0) this.historyIndex--;
                this.localEcho.setInput(this.localEcho._history[this.historyIndex]);
            }
            ev.preventDefault();
        } else if (ev.key === "ArrowDown") {
            if (this.localEcho._history.length > 0) {
                if (this.historyIndex < this.localEcho._history.length - 1) this.historyIndex++;
                else this.historyIndex = -1;

                this.localEcho.setInput(this.historyIndex === -1 ? "" : this.localEcho._history[this.historyIndex]);
            }
            ev.preventDefault();
        }
    }

    /**
     * プロンプト表示して待機
     * @returns {void}
     */
    showPrompt() {
        this.historyIndex = -1;
        // Promiseチェーンでプロンプトを再帰的に表示
        this.localEcho.read("~$ ")
            .then(input => this.handleCommand(input.trim()))
            .then(() => this.showPrompt()) // コマンド処理後に次のプロンプトを表示
            .catch(() => this.showPrompt());
    }

    /**
     * 入力されたコマンド処理して出力
     * @param {string} input
     * @returns {void}
     */
    handleCommand(input) {
        if (!input) return;
        this.localEcho._history.push(input);

        // 組み込みはここに
        switch (input) {
            case "clear":
                this.term.reset();
                return;

            case "ls":
                const all = [...Object.keys(this.commands), "clear", "ls"];
                all.sort();
                const ls_msg = "Commands:\r\n" + all.map(c => " " + c).join("\r\n") + "\r\n";
                this.term.write(ls_msg);
                return;
        }

        // yamlから
        const cmd = this.commands[input];
        if (!cmd) {
            this.localEcho.println(`Command not found: ${input}`);
            return;
        }

        const output = cmd[this.yamlConfig.outputKey] || [];
        output.forEach(it => this.localEcho.println(it.text));
    }
}
