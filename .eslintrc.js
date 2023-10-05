module.exports = {
  extends: [
    './node_modules/commons/dist/eslint/universal',
    './node_modules/commons/dist/eslint/jest',
    './node_modules/commons/dist/eslint/react',
  ],
  parserOptions: {
    project: ['./tsconfig.json', './cypress/tsconfig.json', './hardhat/tsconfig.json', './dev-scripts/tsconfig.json'],
  },
  rules: {
    'unicorn/consistent-function-scoping': 'off', // Disabling due to the rule's constraints conflicting with established patterns, especially in test suites where local helper or mocking functions are prevalent and do not necessitate exports.
    '@typescript-eslint/prefer-nullish-coalescing': 'off', // TODO: Why it doesn't work

    // NOTE: ignored because the project is not ready for it
    'unicorn/filename-case': 'off',
    'import/no-default-export': 'off',
    'prefer-arrow/prefer-arrow-functions': 'off',
    '@typescript-eslint/no-restricted-imports': 'off',
  },
};
