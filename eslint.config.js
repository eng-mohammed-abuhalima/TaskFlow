import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'docs']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Design-system files export class maps and helpers next to their components on purpose;
    // context files export their provider together with its hook.
    files: ['src/components/**/*.jsx', 'src/lib/**/*.jsx', 'src/context/**/*.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
