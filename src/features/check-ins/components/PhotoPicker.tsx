import { Image } from "expo-image";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { X } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { colors } from "@/styles/tokens";
import { uploadFoodPhoto } from "../services/logs";

export const MAX_PHOTOS = 3;
// Same resize/quality as the web's compressImage(file, 1600, 0.8) before upload.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

export type PhotoSlot =
  | { kind: "existing"; url: string }
  | { kind: "new"; key: string; previewUri: string; uploading: boolean; url?: string; error?: string };

async function compress(asset: ImagePicker.ImagePickerAsset) {
  const longest = Math.max(asset.width, asset.height);
  const resize =
    longest > MAX_DIMENSION
      ? [{ resize: asset.width >= asset.height ? { width: MAX_DIMENSION } : { height: MAX_DIMENSION } }]
      : [];
  return (await manipulateAsync(asset.uri, resize, { compress: JPEG_QUALITY, format: SaveFormat.JPEG })).uri;
}

/**
 * The web Log form's Photo section: today's photos and new ones as 56px thumbnails with a remove
 * ✕, a spinner while each uploads, and "Add photos" (camera or gallery — what the web's file input
 * offers on Android) up to 3. Each new photo is compressed and uploaded right away; the caller
 * saves the resulting URLs with the log, and must not save while one is uploading or failed.
 */
export function PhotoPicker({ slots, onChange }: { slots: PhotoSlot[]; onChange: (update: (prev: PhotoSlot[]) => PhotoSlot[]) => void }) {
  const getToken = useApiToken();
  const [picking, setPicking] = useState(false);
  const remaining = MAX_PHOTOS - slots.length;

  async function addAssets(assets: ImagePicker.ImagePickerAsset[]) {
    for (const asset of assets.slice(0, remaining)) {
      const key = `${asset.uri}-${Date.now()}`;
      onChange((prev) => [...prev, { kind: "new", key, previewUri: asset.uri, uploading: true }]);
      const update = (patch: Partial<Extract<PhotoSlot, { kind: "new" }>>) =>
        onChange((prev) => prev.map((slot) => (slot.kind === "new" && slot.key === key ? { ...slot, ...patch } : slot)));
      compress(asset)
        .then((uri) => uploadFoodPhoto(getToken, uri))
        .then(({ url }) => update({ uploading: false, url }))
        .catch(() => update({ uploading: false, error: "Upload failed" }));
    }
  }

  async function pick(source: "camera" | "library") {
    setPicking(true);
    try {
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 1 });
        if (!result.canceled) await addAssets(result.assets);
      } else {
        // Android's photo picker — no storage permission needed.
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          selectionLimit: remaining,
          quality: 1,
        });
        if (!result.canceled) await addAssets(result.assets);
      }
    } finally {
      setPicking(false);
    }
  }

  function handleAdd() {
    Alert.alert("Add photos", undefined, [
      { text: "Take photo", onPress: () => pick("camera") },
      { text: "Choose from gallery", onPress: () => pick("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <>
      <Text className="text-xs text-foregroundTertiary">
        {slots.length > 0 ? `${slots.length}/${MAX_PHOTOS} photos` : "Saves on their own, no other answer needed"}
      </Text>
      {slots.length > 0 && (
        <View className="flex-row flex-wrap gap-2 pb-3">
          {slots.map((slot) => {
            const key = slot.kind === "existing" ? slot.url : slot.key;
            return (
              <View key={key} className="relative h-14 w-14">
                <Image
                  source={{ uri: slot.kind === "existing" ? slot.url : slot.previewUri }}
                  style={{ width: 56, height: 56, borderRadius: 8, borderWidth: slot.kind === "new" && slot.error ? 1 : 0, borderColor: colors.danger }}
                  contentFit="cover"
                />
                {slot.kind === "new" && slot.uploading && (
                  <View accessibilityLabel="Uploading photo" className="absolute inset-0 items-center justify-center rounded-lg bg-black/40">
                    <ActivityIndicator color="#ffffff" />
                  </View>
                )}
                {slot.kind === "new" && slot.error && (
                  <Text numberOfLines={1} className="absolute left-0 top-full w-14 pt-0.5 text-center text-[9px] text-danger">
                    {slot.error}
                  </Text>
                )}
                <Pressable
                  onPress={() => onChange((prev) => prev.filter((s) => s !== slot))}
                  accessibilityLabel="Remove photo"
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-surface p-0.5"
                  style={{ boxShadow: `2px 2px 0 0 ${colors.edge}` }}
                >
                  <X size={14} color={colors.foregroundTertiary} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
      {remaining > 0 && (
        <View className="self-start">
          <Button variant="secondary" title="Add photos" onPress={handleAdd} disabled={picking} />
        </View>
      )}
    </>
  );
}
