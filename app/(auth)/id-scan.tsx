import React, { useMemo, useRef, useState } from "react";

import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { useSignup } from "@/hooks/use-signup-flow";

export default function IdScanScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { setIdentityImageUri } = useSignup();

  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [capturing, setCapturing] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const hasPermission = permission?.granted;

  const onCapture = async () => {
    if (!cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
      });
      setPhotoUri(photo.uri);
    } catch {
      Alert.alert(t("error"), t("captureFailed"));
    } finally {
      setCapturing(false);
    }
  };

  const canUse = useMemo(
    () => typeof photoUri === "string" && photoUri.length > 0,
    [photoUri],
  );

  const onUse = () => {
    if (!photoUri) return;
    setIdentityImageUri(photoUri);
    router.push("/(auth)/selfie" as any);
  };

  if (!permission) return null;

  if (!hasPermission) {
    return (
      <ThemedView style={styles.permission}>
        <Animated.View
          entering={FadeInDown.duration(450)}
          style={styles.permissionCard}
        >
          <ThemedText type="subtitle">{t("scanYourId")}</ThemedText>
          <ThemedText style={styles.permissionText}>
            {t("cameraPermissionNeeded")}
          </ThemedText>
          <GradientButton
            label={t("continue")}
            onPress={() => void requestPermission()}
          />
        </Animated.View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.topText}>
        <Animated.View entering={FadeInDown.duration(450)}>
          <ThemedText type="subtitle" style={styles.title}>
            {t("scanYourId")}
          </ThemedText>
          <ThemedText style={styles.subtitle}>{t("idScanHint")}</ThemedText>
        </Animated.View>
      </View>

      <View style={styles.cameraWrap}>
        {photoUri ? (
          <Animated.View
            entering={FadeIn.duration(250)}
            style={styles.previewWrap}
          >
            <Image
              source={{ uri: photoUri }}
              style={styles.preview}
              contentFit="cover"
            />
          </Animated.View>
        ) : (
          <CameraView
            ref={(r) => {
              cameraRef.current = r;
            }}
            style={styles.camera}
            facing="back"
          >
            <View style={styles.overlay}>
              <View style={styles.idFrame}>
                <View style={[styles.corner, styles.tl]} />
                <View style={[styles.corner, styles.tr]} />
                <View style={[styles.corner, styles.bl]} />
                <View style={[styles.corner, styles.br]} />
              </View>
            </View>
          </CameraView>
        )}
      </View>

      <View style={styles.actions}>
        {photoUri ? (
          <View style={styles.row}>
            <Pressable
              onPress={() => setPhotoUri(null)}
              style={({ pressed }) => [
                styles.secondary,
                pressed ? styles.pressed : null,
              ]}
            >
              <ThemedText type="defaultSemiBold">{t("retake")}</ThemedText>
            </Pressable>
            <GradientButton
              label={t("usePhoto")}
              onPress={onUse}
              disabled={!canUse}
              style={{ flex: 1 }}
            />
          </View>
        ) : (
          <Pressable
            onPress={onCapture}
            style={({ pressed }) => [
              styles.capture,
              pressed ? styles.pressed : null,
            ]}
          >
            {capturing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.captureText}>
                {t("capture")}
              </ThemedText>
            )}
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topText: {
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 6,
  },
  cameraWrap: {
    flex: 1,
    padding: 16,
  },
  camera: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  idFrame: {
    width: "92%",
    aspectRatio: 1.6,
    borderRadius: 18,
  },
  corner: {
    position: "absolute",
    width: 26,
    height: 26,
    borderColor: "#A78BFA",
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  actions: {
    padding: 16,
    paddingBottom: 30,
  },
  capture: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6D28D9",
  },
  captureText: {
    color: "#fff",
  },
  pressed: {
    opacity: 0.88,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  secondary: {
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 24, 28, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 28, 0.08)",
  },
  previewWrap: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  permission: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  permissionCard: {
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 28, 0.08)",
    backgroundColor: "rgba(17, 24, 28, 0.03)",
  },
  permissionText: {
    opacity: 0.7,
    marginBottom: 6,
  },
});
