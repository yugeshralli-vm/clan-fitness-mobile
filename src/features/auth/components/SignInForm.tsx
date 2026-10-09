import { useSignIn, useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Text } from "@/components/ui/Text";
import Svg, { Path } from "react-native-svg";

export function SignInForm() {
  // @clerk/expo's useSignIn() is the newer "Future" API — signIn.password()/.finalize() return
  // { error } rather than the classic create()/setActive() shape (see SignInFutureResource).
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSignIn() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const { error: passwordError } = await signIn.password({ identifier, password });
      if (passwordError) {
        setError(passwordError.message ?? "Sign-in failed.");
        return;
      }
      if (signIn.status !== "complete") {
        setError(`Additional verification required (${signIn.status}) — not supported in this build yet.`);
        return;
      }
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setError(finalizeError.message ?? "Sign-in failed.");
        return;
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setPending(false);
    }
  }

  async function handleGoogleSignIn() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy: "oauth_google" });
      if (!createdSessionId || !setActive) return; // user cancelled the browser flow
      await setActive({ session: createdSessionId });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <View className="flex-1 justify-center gap-4 bg-background px-6">
      <Text className="mb-2 text-3xl font-bold text-foreground">Clan Fitness</Text>
      <Pressable
        onPress={handleGoogleSignIn}
        disabled={pending}
        className="flex-row items-center justify-center gap-3 rounded-lg border border-surfaceBorder bg-surface py-3 disabled:opacity-40"
      >
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
          <Path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
          <Path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.348 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
          <Path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
        </Svg>
        <Text className="font-semibold text-foreground">Continue with Google</Text>
      </Pressable>
      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-surfaceBorder" />
        <Text className="text-xs text-foregroundTertiary">OR</Text>
        <View className="h-px flex-1 bg-surfaceBorder" />
      </View>
      <TextInput
        value={identifier}
        onChangeText={setIdentifier}
        placeholder="Email"
        placeholderTextColor="rgba(255,255,255,0.3)"
        autoCapitalize="none"
        keyboardType="email-address"
        className="rounded-lg border border-surfaceBorder bg-surface px-4 py-3 text-foreground"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="rgba(255,255,255,0.3)"
        secureTextEntry
        className="rounded-lg border border-surfaceBorder bg-surface px-4 py-3 text-foreground"
      />
      {error && <Text className="text-sm text-danger">{error}</Text>}
      <Pressable
        onPress={handleSignIn}
        disabled={pending}
        className="items-center rounded-lg bg-accent py-3 disabled:opacity-40"
      >
        <Text className="font-bold text-accentForeground">{pending ? "Signing in..." : "Sign in"}</Text>
      </Pressable>
    </View>
  );
}
