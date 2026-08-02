module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  plugins.push('react-native-worklets/plugin');
  plugins.push([
    '@tamagui/babel-plugin',
    {
      components: ['tamagui'],
      config: './theme/tamagui.config.ts',
      logTimings: true,
    },
  ]);

  return {
    presets: ['babel-preset-expo'],

    plugins,
  };
};
