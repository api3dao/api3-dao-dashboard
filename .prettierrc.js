module.exports = {
  bracketSpacing: true,
  printWidth: 80,
  singleQuote: true,
  trailingComma: 'es5',
  useTabs: false,
  overrides: [
    {
      files: '*.ts',
      options: {
        parser: 'typescript'
      }
    },
    {
      files: '*.sol',
      options: {
        singleQuote: false
      }
    }
  ]
}
