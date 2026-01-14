import { Terminal } from 'xterm';

/**
 * すべてのエフェクトクラスが実装すべきインターフェース
 */
export interface IEffect {
    /**
     * エフェクトのメイン実行ロジック
     * 完了時に解決されるPromiseを返す必要がある
     */
    execute(): Promise<void>;
}

/**
 * エフェクトクラスのコンストラクタを定義する型
 */
export type EffectConstructor = new (term: Terminal, options?: any) => IEffect;

/**
 * すべてのエフェクトに共通する設定オプション
 */
export interface EffectConfig {
    duration?: number;
    fps?: number;
    rowCount?: number;
}
