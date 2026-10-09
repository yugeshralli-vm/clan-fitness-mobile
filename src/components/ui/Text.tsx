import { Text as RNText, type TextProps } from "react-native";
import { colors } from "@/styles/tokens";

// `text-<color>` classes from the theme (plus Tailwind's own named colors used in the port).
// NativeWind resolves two conflicting color classes by stylesheet order, not by their order in
// className, so the default color must only be added when the caller didn't pass one.
const COLOR_CLASS = new RegExp(`\\btext-(${[...Object.keys(colors), "white", "black", "amber-\\d+"].join("|")})\\b`);
const SIZE_CLASS = /\btext-(xs|sm|base|lg|xl|\d+xl|\[[^\]]+\])(?![\w-])/;

/**
 * The app's Text: Satoshi, 16px and the web body color by default, like the web's `body` (and a
 * browser's 16px default). React Native has no inherited font and defaults to 14px, so every text
 * node goes through this instead of react-native's Text.
 */
export function Text({ className = "", ...props }: TextProps & { className?: string }) {
  const color = COLOR_CLASS.test(className) ? "" : "text-foreground";
  const size = SIZE_CLASS.test(className) ? "" : "text-base";
  return <RNText className={`font-sans ${size} ${color} ${className}`} {...props} />;
}
