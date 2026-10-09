import { useState } from "react";
import { Pressable, View, type PressableProps } from "react-native";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "danger";

const VARIANT: Record<Variant, { box: string; label: string }> = {
  primary: { box: "bg-accent", label: "text-accentForeground" },
  secondary: { box: "border border-surfaceBorder bg-surface", label: "text-foreground" },
  danger: { box: "bg-danger", label: "text-white" },
};

/**
 * Port of the web Button (src/components/ui/button.tsx): square corners, bold small label, and the
 * hard 4px "edge" drop shadow that the button presses down into. RN has no offset box-shadow on
 * Android, so the shadow is a solid edge-colored block behind it.
 */
export function Button({
  title,
  variant = "primary",
  disabled,
  className = "",
  ...props
}: Omit<PressableProps, "children"> & { title: string; variant?: Variant; className?: string }) {
  const [pressed, setPressed] = useState(false);
  const down = pressed && !disabled;
  return (
    <View className={`${disabled ? "opacity-40" : ""} ${className}`}>
      {!disabled && !down && <View className="absolute inset-0 bg-edge" style={{ transform: [{ translateX: 4 }, { translateY: 4 }] }} />}
      <Pressable
        disabled={disabled}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        className={`items-center px-5 py-2.5 ${VARIANT[variant].box}`}
        style={down ? { transform: [{ translateX: 4 }, { translateY: 4 }] } : undefined}
        {...props}
      >
        <Text className={`text-sm font-bold tracking-tight ${VARIANT[variant].label}`}>{title}</Text>
      </Pressable>
    </View>
  );
}
