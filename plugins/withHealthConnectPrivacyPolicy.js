const { withMainActivity } = require("expo/config-plugins");
const { mergeContents } = require("@expo/config-plugins/build/utils/generateCode");

const PRIVACY_POLICY_URL = "https://www.clanfitness.in/privacy";

/**
 * Health Connect's permission screen links to "the developer's privacy policy" by launching this
 * app with ACTION_SHOW_PERMISSIONS_RATIONALE (Android 13 and below) or VIEW_PERMISSION_USAGE
 * (Android 14+) — react-native-health-connect's plugin routes both to MainActivity. Google Play
 * requires that link to show the policy, so MainActivity opens /privacy in the browser and closes
 * instead of starting the app for those two intents.
 */
module.exports = function withHealthConnectPrivacyPolicy(config) {
  return withMainActivity(config, (config) => {
    config.modResults.contents = mergeContents({
      tag: "health-connect-privacy-policy",
      src: config.modResults.contents,
      newSrc: [
        '    if (intent?.action == "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" ||',
        '        intent?.action == "android.intent.action.VIEW_PERMISSION_USAGE") {',
        "      startActivity(",
        "        android.content.Intent(",
        "          android.content.Intent.ACTION_VIEW,",
        `          android.net.Uri.parse("${PRIVACY_POLICY_URL}"),`,
        "        ),",
        "      )",
        "      finish()",
        "      return",
        "    }",
      ].join("\n"),
      anchor: /super\.onCreate\(/,
      offset: 1,
      comment: "//",
    }).contents;
    return config;
  });
};
