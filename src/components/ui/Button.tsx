import type { LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View, type PressableProps } from "react-native";
import { colors } from "@/styles/tokens";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "danger";

const VARIANT: Record<Variant, { box: string; label: string; icon: string }> = {
  primary: { box: "bg-accent", label: "text-accentForeground", icon: colors.accentForeground },
  secondary: { box: "border border-surfaceBorder bg-surface", label: "text-foreground", icon: colors.foreground },
  danger: { box: "bg-danger", label: "text-white", icon: "#ffffff" },
};

/**
 * Port of the web Button (src/components/ui/button.tsx): square corners, bold small label, and the
 * hard 4px "edge" drop shadow that the button presses down into. RN has no offset box-shadow on
 * Android, so the shadow is a solid edge-colored block behind it. `icon` without a title is the
 * web's square icon button (`p-2.5!`, e.g. regenerate invite code) — pass accessibilityLabel.
 */
export function Button({
  title,
  icon: Icon,
  variant = "primary",
  disabled,
  className = "",
  ...props
}: Omit<PressableProps, "children"> & { title?: string; icon?: LucideIcon; variant?: Variant; className?: string }) {
  const [pressed, setPressed] = useState(false);
  const down = pressed && !disabled;
  return (
    <View className={`${disabled ? "opacity-40" : ""} ${className}`}>
      {!disabled && !down && <View className="absolute inset-0 bg-edge" style={{ transform: [{ translateX: 4 }, { translateY: 4 }] }} />}
      <Pressable
        disabled={disabled}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        className={`items-center justify-center ${title ? "px-5 py-2.5" : "p-2.5"} ${VARIANT[variant].box}`}
        style={down ? { transform: [{ translateX: 4 }, { translateY: 4 }] } : undefined}
        {...props}
      >
        {title ? (
          <Text className={`text-sm font-bold tracking-tight ${VARIANT[variant].label}`}>{title}</Text>
        ) : Icon ? (
          <Icon size={16} color={VARIANT[variant].icon} />
        ) : null}
      </Pressable>
    </View>
  );
}
