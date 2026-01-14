import 'xterm/css/xterm.css';
import { TerminalApp } from './TerminalApp';

// グローバル変数としてインスタンスを保持し、リロード時に破棄できるようにする
let appInstance: TerminalApp | null = null;

/**
 * ターミナルの起動とクリーンアップを行う
 */
const startApp = () => {
    const terminalElement = document.getElementById("terminal");

    if (terminalElement) {
        // 1. 既存の描画内容をクリアし、古いインスタンスの干渉を防ぐ
        terminalElement.innerHTML = '';

        // 2. 新しいインスタンスを生成
        appInstance = new TerminalApp(terminalElement);

        appInstance.init().catch(err => {
            console.error("Terminal initialization failed:", err);
        });
    } else {
        console.error("Terminal DOM not found");
    }
};

// 初回起動
startApp();

/**
 * Viteのホットリロード(HMR)時の処理
 * これにより、コードを保存した際に古いターミナルが完全に破棄される
 */
// @ts-ignore
if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(() => {
        console.log("HMR: Reloading TerminalApp...");
        // ページ全体のリロードを行わずに、Appの再起動を試みる
        location.reload();
    });
}
