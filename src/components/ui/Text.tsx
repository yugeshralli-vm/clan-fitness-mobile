import { Text as RNText, type TextProps } from "react-native";
import { colors } from "@/styles/tokens";

// `text-<color>` classes from the theme (plus Tailwind's own named colors used in the port).
// NativeWind resolves two conflicting color classes by stylesheet order, not by their order in
// className, so the default color must only be added when the caller didn't pass one.
const COLOR_CLASS = new RegExp(`\\btext-(${[...Object.keys(colors), "white", "black", "amber-\\d+"].join("|")})\\b`);

/**
 * The app's Text: Satoshi + the web body color by default, like `body { font-family; color }` in
 * the web app's globals.css. React Native has no inherited/global font, so every text node goes
 * through this instead of react-native's Text.
 */
export function Text({ className = "", ...props }: TextProps & { className?: string }) {
  const color = COLOR_CLASS.test(className) ? "" : "text-foreground";
  return <RNText className={`font-sans ${color} ${className}`} {...props} />;
}
