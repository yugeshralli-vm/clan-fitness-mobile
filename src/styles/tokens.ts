/**
 * Single source of truth for design tokens — ported from clan-fitness's src/app/globals.css
 * (the web app's brand palette), not a redesign. tailwind.config.js reads this same file for
 * NativeWind's theme, and any RN code NativeWind can't reach (StatusBar, splash screen, SVG
 * fill props) imports these constants directly. Never hardcode a color/font value elsewhere —
 * add it here first.
 */

export const colors = {
  background: "#0d0d0d",
  surface: "#121212",
  surfaceBorder: "rgba(255, 255, 255, 0.1)",
  foreground: "rgba(255, 255, 255, 0.9)",
  foregroundSecondary: "rgba(255, 255, 255, 0.7)",
  foregroundTertiary: "rgba(255, 255, 255, 0.5)",
  foregroundMuted: "rgba(255, 255, 255, 0.3)",
  accent: "#3bffad",
  accentForeground: "#0d0d0d",
  ember: "#ff8744",
  danger: "#ee4d37",
  success: "#06c270",
  warning: "#f08d32",
  edge: "#3d3d3d",
} as const;

// TODO: web loads Satoshi as .woff2 (src/app/fonts/*.woff2 in clan-fitness) — React Native's
// expo-font needs .ttf/.otf instead. Falls back to the system font until those files are
// sourced; swap this value (and add the actual expo-font useFonts() load) once available.
export const fonts = {
  sans: "System",
} as const;

export type ColorToken = keyof typeof colors;
