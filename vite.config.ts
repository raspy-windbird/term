import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    // ルートはプロジェクト直下にする
    root: './',
    base: './',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        // 出力先を docs に固定（GitHub Pages用）
        outDir: 'docs',
        emptyOutDir: true, // docsの中身をきれいに掃除してから書き出す
        rollupOptions: {
            input: {
                // ルートに移動した index.html を指定
                main: path.resolve(__dirname, 'index.html'),
            },
        },
    },
    server: {
        host: true,
        port: 5000,
    }
});
