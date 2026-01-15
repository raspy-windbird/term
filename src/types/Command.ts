/** コマンド定義の型 */
export interface CommandData {
    [key: string]: {
        output: { text: string }[];
    };
}