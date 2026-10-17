// Used only by scripts/check-names.mjs: the two rules whose failures crash a page.
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: { 'no-undef': 'error', 'react-hooks/rules-of-hooks': 'error' },
  },
]
