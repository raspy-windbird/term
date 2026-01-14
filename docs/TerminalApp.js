import { DigitalFall } from './effects/DigitalFall.js';

/**
 * ターミナルのメインモジュール
 */
export class TerminalApp {
    /** コマンドとエフェクトクラスの対応表（拡張性を確保） */
    EFFECT_MAP = {
        'matrix': DigitalFall,
    };

    /** 外部から読み込む静的コマンド定義 */
    commands = {
        "about": { output: ["Terminal Portfolio v2.0", "Built with xterm.js & Custom Effects."] },
        "contact": { output: ["GitHub: github.com", "Email: hello@example.com"] }
    };

    term = null;
    localEcho = null;

    constructor(domElement) {
        this.domElement = domElement;
    }

    /**
     * アプリ初期化
     */
    async init() {
        try {
            this.setupTerminal(this.domElement);
            this.localEcho.println("Welcome. Type 'ls' to see available commands.");

            // 非同期ループでプロンプトを待機
            this.startLoop();
        } catch (e) {
            console.error(`Init Error: ${e}`);
        }
    }

    /**
     * xterm.js・local-echoのセットアップ
     */
    setupTerminal(dom) {
        this.term = new Terminal({
            cursorBlink: true,
            lineHeight: 1.4,
            theme: { background: '#1a1a1a' }
        });

        this.localEcho = new LocalEchoController(this.term);
        this.term.open(dom);

        // 絶対消すな
        window.term = this.term;
    }

    /**
     * メイン入力ループ
     */
    async startLoop() {
        while (true) {
            try {
                const input = await this.localEcho.read("~$ ");
                const trimmedInput = input.trim();

                if (trimmedInput) {
                    await this.handleCommand(trimmedInput);
                }
            } catch (e) {
                // Ctrl+C 等の割り込み対応
                console.warn("Input cancelled", e);
            }
        }
    }

    /**
     * コマンドの解析と実行ルートの振り分け
     * @param {string} input
     */
    async handleCommand(input) {
        // 1. アニメーションエフェクトの実行ルート
        const EffectClass = this.EFFECT_MAP[input];
        if (EffectClass) {
            const effect = new EffectClass(this.term, { duration: 3000 });
            await effect.execute(); // 完了するまで await
            return;
        }

        // 2. 組み込みシステムコマンド
        switch (input) {
            case "clear":
                this.term.clear();
                return;

            case "ls":
                const all = [
                    ...Object.keys(this.commands),
                    ...Object.keys(this.EFFECT_MAP),
                    "clear", "ls"
                ].sort();
                this.localEcho.println(all.join("  "));
                return;
        }

        // 3. 静的コマンド（this.commands）からの出力
        const cmd = this.commands[input];
        if (cmd) {
            const lines = cmd.output || [];
            lines.forEach(line => this.localEcho.println(line));
        } else {
            this.localEcho.println(`command not found: ${input}`);
        }
    }
}
