module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  ignorePatterns: [".eslintrc.js", "node_modules", "tests", "jest.config.js"],
  "rules": {
    "no-async-promise-executor": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-explicit-any": "off",
  }
};
