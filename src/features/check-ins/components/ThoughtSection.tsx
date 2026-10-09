import { Text, TextInput, View } from "react-native";

type Props = {
  text: string;
  onTextChange: (value: string) => void;
};

export function ThoughtSection({ text, onTextChange }: Props) {
  return (
    <View className="gap-3 rounded-lg border border-surfaceBorder bg-surface p-4">
      <Text className="text-base font-semibold text-foreground">💭 Thought</Text>
      <TextInput
        value={text}
        onChangeText={onTextChange}
        placeholder="What's on your mind?"
        placeholderTextColor="rgba(255,255,255,0.3)"
        multiline
        maxLength={200}
        className="min-h-20 rounded-lg border border-surfaceBorder bg-background px-3 py-2 text-foreground"
      />
    </View>
  );
}
