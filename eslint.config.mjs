import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default defineConfig([
    globalIgnores([
        "**/node_modules",
        "**/dist",
        "**/.github",
        "**/.git",
        "**/.vscode",
        "**/bin",
        "**/coverage",
        "**/testes",
    ]),

    js.configs.recommended,

    {
        files: ["**/*.ts"],

        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },

        plugins: {
            "@typescript-eslint": typescriptEslint,
        },

        rules: {
            ...typescriptEslint.configs.recommended.rules,

            "prettier/prettier": "off",
            "no-constant-condition": "off",
            "no-useless-catch": "off",
            "no-prototype-builtins": "off",
            "prefer-spread": "off",
            "no-useless-escape": "off",
            "no-case-declarations": "off",
            "no-unsafe-finally": "off",
            "no-fallthrough": "off",
            "prefer-const": "off",
            "no-var": "off",

            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-unsafe-function-type": "warn",
            "@typescript-eslint/adjacent-overload-signatures": "off",
            "@typescript-eslint/no-this-alias": "off",
            "@typescript-eslint/no-inferrable-types": "off",
        },
    },
]);