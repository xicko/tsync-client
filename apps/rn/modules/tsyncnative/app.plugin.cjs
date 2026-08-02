const { createRunOncePlugin, withProjectBuildGradle } = require('@expo/config-plugins');
const pkg = require('../../package.json');

/**
 * @typedef {import('@expo/config-types').ExpoConfig} ExpoConfig
 */


// IN ROOT BUILD.GRADLE =================================
function setClassPath(config, buildGradle) {
  const gradleClassPath = 'org.jetbrains.kotlin:kotlin-serialization:2.1.20';

  const classPathAdded = buildGradle.replace(
    /dependencies\s?{/,
    `dependencies {
    // Added using expo plugin
    classpath('${gradleClassPath}')\n`
  );
  
  return classPathAdded;
}

/**
 * @param {ExpoConfig} config
 */
const withHmssysProjectBuildGradle = (config) => {
  return withProjectBuildGradle(config, (cfg) => {
    if (cfg?.modResults?.language === 'groovy') {
      cfg.modResults.contents = setClassPath(config, cfg.modResults.contents);
    }

    return cfg;
  });
};

const withHmssysPlugin = (config) => {
  config = withHmssysProjectBuildGradle(config);
  return config;
};

module.exports = createRunOncePlugin(withHmssysPlugin, pkg.name, pkg.version);