import { useState } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { colors } from "@/styles/tokens";

/**
 * Port of the web Input/Textarea (src/components/ui/input.tsx): rounded-lg, surface background,
 * surface-border that turns accent on focus, base-size text, muted placeholder.
 */
export function Input({ className = "", onFocus, onBlur, ...props }: TextInputProps & { className?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={colors.foregroundMuted}
      selectionColor={colors.accent}
      cursorColor={colors.accent}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      className={`w-full rounded-lg border bg-surface px-3 py-2 font-sans text-base text-foreground ${
        focused ? "border-accent" : "border-surfaceBorder"
      } ${className}`}
      {...props}
    />
  );
}
