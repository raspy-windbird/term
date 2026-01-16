export { };

declare global {
    /**
     * local-echo.js が提供するコントローラークラス
     */
    class LocalEchoController {
        /**
         * @param term xterm.js の Terminal インスタンス
         * @param options オプション設定
         */
        constructor(term: any, options?: any);

        /** プロンプトを表示して入力を待機 */
        read(prompt: string, continuationPrompt?: string): Promise<string>;

        /** メッセージを出力して改行 */
        println(message: string): void;

        /** メッセージを出力 */
        print(message: string): void;

        /** 入力バッファを強制的に書き換える（履歴操作などで利用） */
        setInput(input: string): void;

        /** 履歴の配列（内部プロパティ） */
        _history: string[];
    }

    /** windowオブジェクトの拡張定義 */
    interface Window {
        term: any;
        LocalEchoController: typeof LocalEchoController;
    }
}