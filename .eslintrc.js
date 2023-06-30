module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'prettier',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['react'],
  rules: {
    'import/prefer-default-export': 0,
    'no-void': ['error', { allowAsStatement: true }],
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',

    // OBSOLETED (joakims)
    // 'react/jsx-props-no-spreading': 0,
    // 'no-promise-executor-return': 0,
    // 'react-hooks/exhaustive-deps': 0,
    // '@typescript-eslint/no-use-before-define': 0,
    // '@typescript-eslint/no-shadow': 0,
    // '@typescript-eslint/no-unused-vars': 0,
    // 'import/no-cycle': 0,
    // 'react/jsx-no-duplicate-props': 0,
    // 'react/destructuring-assignment': 0,
    // 'consistent-return': 0,
    // 'react/no-array-index-key': 0,
    // 'react/jsx-no-constructed-context-values': 0,
    // 'no-void': 0,
    // '@typescript-eslint/no-unused-expressions': 0,
    // 'no-sequences': 0,
  },
}
