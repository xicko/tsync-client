/* global __dirname */
const path = require('path');

module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  plugins.push('react-native-worklets/plugin');
  plugins.push([
    '@tamagui/babel-plugin',
    {
      components: ['tamagui'],
      config: path.resolve(__dirname, '../../packages/core/theme/tamagui.config'),
      logTimings: true,
    },
  ]);

  return {
    presets: ['babel-preset-expo'],

    plugins,
  };
};
