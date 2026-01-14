// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";

export default [
    // チェック対象から除外するディレクトリ（distやnode_modulesなど）
    { ignores: [
        "dist",
        "node_modules",
        "vendor",
        "docs/js/local-echo.js"
    ] },

    // 推奨ルールの適用
    js.configs.recommended,

    {
        languageOptions: {
            ecmaVersion: 2026,          // 2026年の最新構文に対応
            sourceType: "module",
            globals: {
                ...globals.browser,      // window や document を許可
                ...globals.node          // process や __dirname を許可
            },
        },
        rules: {
            "no-unused-vars": "warn",   // 未使用の変数がある場合に警告
            "no-console": "off",        // console.log を許可（必要に応じて warn に変更）
        },
    },
];
