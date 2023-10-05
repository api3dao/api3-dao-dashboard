module.exports = {
  extends: [
    './node_modules/commons/dist/eslint/universal',
    './node_modules/commons/dist/eslint/jest',
    './node_modules/commons/dist/eslint/react',
  ],
  parserOptions: {
    project: ['./tsconfig.json', './packages/*/tsconfig.json'],
  },
  rules: {
    'unicorn/consistent-function-scoping': 'off', // Disabling due to the rule's constraints conflicting with established patterns, especially in test suites where local helper or mocking functions are prevalent and do not necessitate exports.
    '@typescript-eslint/prefer-nullish-coalescing': 'off', // TODO: Why it doesn't work
  },
};
