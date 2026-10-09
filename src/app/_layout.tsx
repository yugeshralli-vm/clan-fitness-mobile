import "../global.css";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();
// Required by @clerk/expo's useSSO() — resolves the auth session promise when the
// OAuth browser tab redirects back into the app (iOS in particular needs this called
// once at module scope, not just inside the SSO flow itself).
WebBrowser.maybeCompleteAuthSession();

const envPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!envPublishableKey) {
  throw new Error("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set — check .env.");
}
// Re-bound so the narrowing survives into RootLayout (TS doesn't carry it across function scopes).
const publishableKey: string = envPublishableKey;

// Dual-guard pattern: (app) is reachable only when signed in, (auth) only when signed out —
// Expo Router/Clerk's current recommended approach, replacing the older useAuth()+<Redirect>
// pattern (this also auto-cleans navigation history when a guard flips, e.g. on sign-out).
function RootNavigator() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded) SplashScreen.hideAsync();
  }, [isLoaded]);

  if (!isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn === true}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn === false}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootNavigator />
    </ClerkProvider>
  );
}
