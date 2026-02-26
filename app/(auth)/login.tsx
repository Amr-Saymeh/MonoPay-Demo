import React, { useMemo, useState } from "react";

import { Link, useRouter } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LanguageSwitch } from "@/components/language-switch";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/src/providers/AuthProvider";

export default function LoginScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { signIn, signingIn } = useAuth();
  const insets = useSafeAreaInsets();

  const tint = useThemeColor({}, "tint");

  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [secure, setSecure] = useState(true);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && pin.trim().length > 0,
    [email, pin],
  );

  const onLogin = async () => {
    try {
      await signIn(email, pin);
      router.replace("/" as any);
    } catch {
      Alert.alert(t("error"), t("failedToSignIn"));
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <LanguageSwitch />
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.titleBlock}
        >
          <ThemedText style={styles.title}>{t("signIn")}</ThemedText>
          <ThemedText style={styles.brand}>
            {t("appName").toUpperCase()}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(500).delay(80)}
          style={styles.form}
        >
          <AuthInput
            value={email}
            onChangeText={setEmail}
            placeholder={t("email")}
            keyboardType="email-address"
          />
          <AuthInput
            value={pin}
            onChangeText={setPin}
            placeholder={t("pin")}
            secureTextEntry={secure}
            onToggleSecure={() => setSecure((s) => !s)}
            keyboardType="number-pad"
          />

          <GradientButton
            label={t("login")}
            onPress={onLogin}
            disabled={!canSubmit}
            loading={signingIn}
          />
        </Animated.View>

        <View
          style={[styles.footer, { bottom: Math.max(16, insets.bottom + 16) }]}
        >
          <ThemedText style={styles.footerBrand}>{t("appName")}</ThemedText>
          <View style={styles.footerRow}>
            <ThemedText style={styles.footerMuted}>
              {t("noAccount")}{" "}
            </ThemedText>
            <Link href={"/(auth)/signup-details" as any} style={styles.link}>
              <ThemedText style={[styles.linkText, { color: tint }]}>
                {t("signUp")}
              </ThemedText>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  titleBlock: {
    alignItems: "center",
    marginBottom: 28,
    gap: 10,
  },
  title: {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: Fonts.rounded,
    includeFontPadding: false,
  },
  brand: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 1.5,
    color: "#8B5CF6",
    fontFamily: Fonts.rounded,
    includeFontPadding: false,
  },
  form: {
    gap: 14,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 12,
  },
  footerBrand: {
    opacity: 0.7,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerMuted: {
    opacity: 0.7,
  },
  link: {
    paddingHorizontal: 2,
  },
  linkText: {
    fontFamily: Fonts.sansBold,
  },
});
