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
import { useAuth } from "@/src/providers/AuthProvider";

export default function SelfieScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { register, registering } = useAuth();
  const {
    details,
    identityImageUri,
    categories,
    setPersonalImageUri,
    personalImageUri,
    clear,
  } = useSignup();

  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [capturing, setCapturing] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(personalImageUri);

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

  const onUse = async () => {
    if (!details || !identityImageUri || !photoUri) {
      Alert.alert(t("error"), t("missingSignupData"));
      router.replace("/(auth)/signup-details" as any);
      return;
    }

    setPersonalImageUri(photoUri);

    try {
      await register({
        firstName: details.firstName,
        lastName: details.lastName,
        email: details.email,
        pin: details.pin,
        phone: details.phone,
        address: details.address,
        identityNumber: Number(details.identityNumber),
        identityImageUri,
        personalImageUri: photoUri,
        categories,
      });

      clear();
      router.replace("/(auth)/welcome" as any);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("uploadFailed");
      Alert.alert(t("error"), msg || t("uploadFailed"));
    }
  };

  if (!permission) return null;

  if (!hasPermission) {
    return (
      <ThemedView style={styles.permission}>
        <Animated.View
          entering={FadeInDown.duration(450)}
          style={styles.permissionCard}
        >
          <ThemedText type="subtitle">{t("takeSelfie")}</ThemedText>
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
            {t("takeSelfie")}
          </ThemedText>
          <ThemedText style={styles.subtitle}>{t("selfieHint")}</ThemedText>
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
            facing="front"
          >
            <View style={styles.overlay}>
              <View style={styles.selfieOval} />
              <View style={styles.glow1} />
              <View style={styles.glow2} />
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
              loading={registering}
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
  },
  selfieOval: {
    width: 240,
    height: 320,
    borderRadius: 160,
    borderWidth: 5,
    borderColor: "rgba(167, 139, 250, 0.95)",
  },
  glow1: {
    position: "absolute",
    width: 260,
    height: 340,
    borderRadius: 180,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.35)",
  },
  glow2: {
    position: "absolute",
    width: 285,
    height: 370,
    borderRadius: 190,
    borderWidth: 2,
    borderColor: "rgba(109, 40, 217, 0.18)",
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
