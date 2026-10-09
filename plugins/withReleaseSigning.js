const { withAppBuildGradle } = require("expo/config-plugins");

/**
 * Signs release builds with the Play upload key, read at build time from
 * ~/.android-keys/clan-fitness-upload.properties (outside the repo; see docs/play-store/README.md).
 * Without that file, release builds fall back to the debug key, so CI or another machine can still
 * build a release APK for testing, just not one Play will accept.
 */
const PROPS = 'new File(System.getProperty("user.home"), ".android-keys/clan-fitness-upload.properties")';

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let gradle = config.modResults.contents;
    if (gradle.includes("clan-fitness-upload.properties")) return config;

    gradle = gradle.replace(
      /signingConfigs \{\n/,
      `signingConfigs {
        release {
            def uploadProps = ${PROPS}
            if (uploadProps.exists()) {
                def p = new Properties()
                uploadProps.withInputStream { p.load(it) }
                storeFile file(p["CLANFITNESS_UPLOAD_STORE_FILE"])
                storePassword p["CLANFITNESS_UPLOAD_STORE_PASSWORD"]
                keyAlias p["CLANFITNESS_UPLOAD_KEY_ALIAS"]
                keyPassword p["CLANFITNESS_UPLOAD_KEY_PASSWORD"]
            }
        }
`,
    );
    // Only the release buildType's signingConfig line (the second occurrence; debug's comes first).
    const releaseBlock = gradle.indexOf("release {", gradle.indexOf("buildTypes {"));
    const line = "signingConfig signingConfigs.debug";
    const at = gradle.indexOf(line, releaseBlock);
    if (releaseBlock === -1 || at === -1) throw new Error("withReleaseSigning: release buildType not found");
    gradle =
      gradle.slice(0, at) +
      `signingConfig(${PROPS}.exists() ? signingConfigs.release : signingConfigs.debug)` +
      gradle.slice(at + line.length);

    config.modResults.contents = gradle;
    return config;
  });
};
