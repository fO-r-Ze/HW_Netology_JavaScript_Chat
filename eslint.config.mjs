import airbnbBase from "airbnb-eslint9";
import globals from "globals";
import stylistic from "@stylistic/eslint-plugin";
import importPlugin from "eslint-plugin-import";

export default [
  // 1. Игнорируемые папки (замена .eslintignore)
  {
    ignores: [
      "node_modules/",
      "dist/",
      "eslint.config.mjs",
      "webpack.config.js",
    ],
  },

  // 2. Регистрируем плагины, которые используются в правилах airbnb-eslint9
  {
    plugins: {
      "@stylistic": stylistic,
      import: importPlugin,
    },
  },

  // 3. Подключаем сами правила Airbnb
  ...airbnbBase,

  // 4. Ваши настройки языка и кастомные правила
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "no-console": "off",
      "import/extensions": "off",
      "import/prefer-default-export": "off",
      "no-plusplus": "off",
      "func-names": "off",
    },
  },
];