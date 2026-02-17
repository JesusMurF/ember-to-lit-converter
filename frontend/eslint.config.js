import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import lit from 'eslint-plugin-lit';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/', 'dist/'],
  },
  js.configs.recommended,
  lit.configs['flat/recommended'],
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
  },
  eslintConfigPrettier,
];
