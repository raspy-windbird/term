import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    root: './',
    base: './',
    resolve: {
        alias: { '@': path.resolve(__dirname, './src') },
    },
    build: {
        outDir: 'docs',
        // 一度 docs を空にする（index.html は input に指定されているので再生成されます）
        emptyOutDir: true,
        rollupOptions: {
            input: {
                // docs/index.html を起点にする
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
