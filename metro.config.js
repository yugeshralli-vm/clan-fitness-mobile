const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// inlineRem: 16 — NativeWind defaults to React Native's 14px rem, which renders every rem-based
// class (text-sm, p-5, gap-3, …) ~12% smaller than the same class on the web app. The UI is a
// 1:1 port of the web's Tailwind classes, so it has to use the web's 16px rem.
module.exports = withNativeWind(config, { input: "./src/global.css", inlineRem: 16 });
