module.exports = {
  root: true,

  env: {
    node: true,
  },

  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint",
  ],

  parserOptions: {
    ecmaVersion: 2020,
  },

  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/ban-ts-ignore": "warn",
    "@typescript-eslint/interface-name-prefix": "warn",
    "no-prototype-builtins": "warn",
    "@typescript-eslint/no-use-before-define": "warn",
    "@typescript-eslint/no-var-requires": "warn",
    "@typescript-eslint/camelcase": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "no-empty": "warn",
    "for-direction": "warn",
    quotes: [0, "single", { avoidEscape: true }],
  },

  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
        "**/tests/unit/**/*.spec.{j,t}s?(x)",
      ],
      env: {
        jest: true,
      },
    },
  ],
};
