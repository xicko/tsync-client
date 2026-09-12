const {
  createRunOncePlugin,
  withProjectBuildGradle,
  withSettingsGradle,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
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
const withTsyncNativeProjectBuildGradle = (config) => {
  return withProjectBuildGradle(config, (cfg) => {
    if (cfg?.modResults?.language === 'groovy') {
      cfg.modResults.contents = setClassPath(config, cfg.modResults.contents);
    }

    return cfg;
  });
};

/**
 * @param {ExpoConfig} config
 */
const withAutolinkingLockFiles = (config) => {
  return withSettingsGradle(config, (cfg) => {
    if (cfg?.modResults?.language === 'groovy') {
      let contents = cfg.modResults.contents;
      const targetPattern = /extensions\.configure\(com\.facebook\.react\.ReactSettingsExtension\)\s*\{\s*ex\s*->[\s\S]*?expoAutolinking\.rnConfigCommand\)\s*[\r\n]+\s*\}[\r\n]+\}/;

      const replacement = `extensions.configure(com.facebook.react.ReactSettingsExtension) { ex ->
        def lockFiles = files(file('../package.json'), file('app/build.gradle'))
        if (System.getenv('EXPO_USE_COMMUNITY_AUTOLINKING') == '1') {
          def communityConfigCommand = ["npx", "@react-native-community/cli", "config"]
          if (org.apache.tools.ant.taskdefs.condition.Os.isFamily(org.apache.tools.ant.taskdefs.condition.Os.FAMILY_WINDOWS)) {
            communityConfigCommand = ["cmd", "/c"] + communityConfigCommand
          }
          ex.autolinkLibrariesFromCommand(communityConfigCommand, file('..'), lockFiles)
        } else {
          ex.autolinkLibrariesFromCommand(expoAutolinking.rnConfigCommand, file('..'), lockFiles)
        }
      }`;

      if (targetPattern.test(contents)) {
        contents = contents.replace(targetPattern, replacement);
      }
      cfg.modResults.contents = contents;
    }
    return cfg;
  });
};

/**
 * @param {ExpoConfig} config
 */
const withAutolinkingCacheCleaner = (config) => {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const autolinkingDir = path.join(cfg.modRequest.platformProjectRoot, 'build', 'generated', 'autolinking');
      if (fs.existsSync(autolinkingDir)) {
        fs.rmSync(autolinkingDir, { recursive: true, force: true });
      }
      return cfg;
    },
  ]);
};

const withTsyncNativePlugin = (config) => {
  config = withTsyncNativeProjectBuildGradle(config);
  config = withAutolinkingLockFiles(config);
  config = withAutolinkingCacheCleaner(config);
  return config;
};

module.exports = createRunOncePlugin(withTsyncNativePlugin, pkg.name, pkg.version);