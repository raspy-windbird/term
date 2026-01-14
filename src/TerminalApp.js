import { DigitalFall } from './effects/DigitalFall.js';

/**
 * @typedef {Object} StaticCommand
 * @property {string[]} output - 出力するテキストの配列
 */

/**
 * ターミナルのメインアプリケーションクラス
 * TS移行時は各プロパティに明示的な型を付与予定
 */
export class TerminalApp {
    /**
     * エフェクトクラスのマッピング
     * @type {Object.<string, typeof DigitalFall>}
     */
    EFFECT_MAP = {
        'matrix': DigitalFall,
    };

    /**
     * 静的コマンドの定義
     * @type {Object.<string, StaticCommand>}
     */
    commands = {
        "about": { output: ["Terminal Portfolio v2.0", "Refactored for TypeScript migration."] },
        "contact": { output: ["GitHub: github.com"] }
    };

    /**
     * @param {HTMLElement} domElement - ターミナルを表示するDOM要素
     */
    constructor(domElement) {
        this.domElement = domElement;
        /** @type {any} xterm.js Terminal インスタンス */
        this.term = null;
        /** @type {any} local-echo インスタンス */
        this.localEcho = null;
    }

    /**
     * アプリケーションの初期化
     */
    async init() {
        try {
            this.setupTerminal(this.domElement);
            // グローバル参照が必要なライブラリのための暫定処置
            window.term = this.term;

            this.localEcho.println("Welcome. Type 'ls' to see available commands.");
            this.startLoop();
        } catch (e) {
            console.error(`Init Error: ${e}`);
        }
    }

    /** @private */
    setupTerminal(dom) {
        this.term = new Terminal({
            cursorBlink: true,
            lineHeight: 1.4,
            theme: { background: '#1a1a1a' }
        });

        this.localEcho = new LocalEchoController(this.term);
        this.term.open(dom);
    }

    /** @private */
    async startLoop() {
        while (true) {
            try {
                const input = await this.localEcho.read("~$ ");
                const trimmedInput = input.trim();
                if (trimmedInput) await this.handleCommand(trimmedInput);
            } catch (e) {
                console.warn("Input interrupted", e);
            }
        }
    }

    /**
     * @param {string} input
     */
    async handleCommand(input) {
        // 1. エフェクト実行ルート
        const EffectClass = this.EFFECT_MAP[input];
        if (EffectClass) {
            // 必要に応じてここで config を上書きして渡すことが可能
            const effect = new EffectClass(this.term, { duration: 4000 });
            await effect.execute();
            return;
        }

        // 2. システムコマンド
        if (input === "clear") {
            this.term.clear();
            return;
        }

        if (input === "ls") {
            const all = [
                ...Object.keys(this.commands),
                ...Object.keys(this.EFFECT_MAP),
                "clear", "ls"
            ].sort();
            this.localEcho.println(all.join("  "));
            return;
        }

        // 3. 静的コマンド
        const cmd = this.commands[input];
        if (cmd) {
            cmd.output.forEach(line => this.localEcho.println(line));
        } else {
            this.localEcho.println(`command not found: ${input}`);
        }
    }
}
