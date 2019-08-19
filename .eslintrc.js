var OFF = 0, WARN = 1, ERROR = 2;
module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    '@infusionsoft'
  ],
  globals: {
    describe: true,
    document: true,
    it: true,
    expect: true,
    window: true,
    sinon: true,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-use-before-define': OFF,
    'max-len': OFF,
    'vue/no-unused-vars': OFF,
    'linebreak-style': [OFF, 'unix'],
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
};
