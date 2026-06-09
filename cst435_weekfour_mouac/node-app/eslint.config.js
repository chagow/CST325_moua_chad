import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        // Node.js built-in globals (no eslint-plugin-node needed for these)
        process:   'readonly',
        console:   'readonly',
        fetch:     'readonly',   // Node 18+ built-in
        URL:       'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console':     'off',
      'prefer-const':   'error',
      'eqeqeq':         ['error', 'always'],
    },
  },
];
