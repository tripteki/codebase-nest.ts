"use strict";

module.exports = {

    plugins: [

        "@typescript-eslint/eslint-plugin",
    ],

    extends: [

        "@tripteki/eslint-config",
    ],

    rules: {

        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
    },

    root: true, env: { node: true, jest: true, },

    parser: "@typescript-eslint/parser",

    parserOptions: {

        project: "tsconfig.json",
        sourceType: "module",
        tsconfigRootDir: __dirname,
    },

    ignorePatterns: [

        ".eslintrc.js",
    ],
};
