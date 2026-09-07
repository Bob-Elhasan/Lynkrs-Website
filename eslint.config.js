import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Vendored upstream repos are reference material, not our code to lint.
    ignores: ['dist', 'vendor', 'node_modules', 'coverage'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    /*
     * Code ported in from upstream libraries (motion-primitives, the Watermelon
     * UI primitives) is held to a softer bar than code we write. It predates the
     * React Compiler lint rules and rewriting it to satisfy them would mean
     * diverging from upstream for no behavioural gain, which makes future
     * updates painful. These stay visible as warnings rather than silenced.
     */
    files: [
      'src/components/ui/**/*.{ts,tsx}',
      'src/components/motion-primitives/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/lib/get-strict-context.tsx',
    ],
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/refs': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },
);
