import { PartyPopper, Sparkles, Swords } from "lucide-react-native";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Animated, Easing, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/styles/tokens";
import { Text } from "./Text";

type RewardVariant = "contract" | "level" | "duel";
type RewardEntry = { id: string; variant: RewardVariant; eyebrow: string; title: string; badge?: string };

const DURATION_MS = 4200;
const MAX_VISIBLE = 2;

// Port of the web reward-snackbar: its own small store, separate from plain toasts, since these
// moments (contract complete, level up, duel matched) are meant to feel like a bigger deal.
let rewards: RewardEntry[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function dismiss(id: string) {
  rewards = rewards.filter((entry) => entry.id !== id);
  emit();
}

function push(variant: RewardVariant, eyebrow: string, title: string, badge?: string) {
  const id = String(nextId++);
  rewards = [...rewards, { id, variant, eyebrow, title, badge }].slice(-MAX_VISIBLE);
  emit();
  setTimeout(() => dismiss(id), DURATION_MS);
}

export const celebrate = {
  contractComplete: (contractTitle: string, points: number) => push("contract", "Contract complete", contractTitle, `+${points}`),
  levelUp: (level: number) => push("level", "Level up!", `Level ${level}`),
  duelMatched: (opponentName: string) => push("duel", "Duel matched!", `You vs ${opponentName}`),
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => rewards;

/** Mounted once in the app shell; shows celebrations stacked above the bottom nav, like the web. */
export function RewardSnackbar() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const insets = useSafeAreaInsets();
  if (items.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 flex-col-reverse items-center gap-2 px-4"
      style={{ bottom: 104 + insets.bottom }}
    >
      {items.map((entry) => (
        <RewardItem key={entry.id} entry={entry} />
      ))}
    </View>
  );
}

function RewardItem({ entry }: { entry: RewardEntry }) {
  // The web's reward-in: a springy pop from slightly small and low, then a fade/shrink away.
  const enter = useRef(new Animated.Value(0)).current;
  const leave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 400, easing: Easing.bezier(0.34, 1.56, 0.64, 1), useNativeDriver: true }).start();
    const timeout = setTimeout(
      () => Animated.timing(leave, { toValue: 1, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(),
      DURATION_MS - 250,
    );
    return () => clearTimeout(timeout);
  }, [enter, leave]);

  const Icon = entry.variant === "level" ? Sparkles : entry.variant === "duel" ? Swords : PartyPopper;

  return (
    <Animated.View
      accessibilityRole="alert"
      className="w-full max-w-sm flex-row items-start gap-3 rounded-2xl border border-accent/50 bg-surface px-4 py-3.5"
      style={{
        boxShadow: `0 0 28px -8px ${colors.accent}`,
        opacity: Animated.multiply(enter.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: "clamp" }), Animated.subtract(1, leave)),
        transform: [
          { translateY: Animated.add(enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }), leave.interpolate({ inputRange: [0, 1], outputRange: [0, 8] })) },
          { scale: Animated.subtract(enter.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }), leave.interpolate({ inputRange: [0, 1], outputRange: [0, 0.05] })) },
        ],
      }}
    >
      <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15">
        <Icon size={20} color={colors.accent} />
      </View>
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="text-[11px] font-bold uppercase tracking-wide text-accent">
          {entry.eyebrow}
        </Text>
        <Text numberOfLines={2} className="text-base font-bold">
          {entry.title}
        </Text>
      </View>
      {entry.badge && (
        <View className="shrink-0 rounded-full bg-accent px-2.5 py-1">
          <Text className="text-sm font-bold text-accentForeground">{entry.badge}</Text>
        </View>
      )}
    </Animated.View>
  );
}
