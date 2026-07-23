import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export function SignInForm() {
  // @clerk/expo's useSignIn() is the newer "Future" API — signIn.password()/.finalize() return
  // { error } rather than the classic create()/setActive() shape (see SignInFutureResource).
  const { signIn } = useSignIn();
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

  return (
    <View className="flex-1 justify-center gap-4 bg-background px-6">
      <Text className="mb-2 text-3xl font-bold text-foreground">Clan Fitness</Text>
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
