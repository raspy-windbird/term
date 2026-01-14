import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    // 開発サーバーのルートをプロジェクトルートに設定
    root: './',
    // ビルド時のベースパス（GitHub Pages等で必要）
    base: './',
    resolve: {
        alias: {
            // tsconfigで設定した @/ パスをViteにも認識させる
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        // コンパイル後の出力先を docs に設定
        outDir: 'docs',
        // docs 内の既存の index.html などを消さない設定
        emptyOutDir: false,
        rollupOptions: {
            // エントリーポイントの指定
            input: {
                main: path.resolve(__dirname, 'docs/index.html'),
            },
        },
    },
    server: {
        host: true, // 0.0.0.0 で待機
        port: 5173,
        allowedHosts: [
            '.github.dev',
            '.app.github.dev'
        ]
    }
});
