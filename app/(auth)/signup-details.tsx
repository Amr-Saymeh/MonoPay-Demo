import React, { useMemo, useState } from "react";

import { Link, useRouter } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { useSignup } from "@/hooks/use-signup-flow";
import { useThemeColor } from "@/hooks/use-theme-color";

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

export default function SignupDetailsScreen() {
  const { t, isRtl } = useI18n();
  const router = useRouter();
  const { setDetails, clear } = useSignup();
  const insets = useSafeAreaInsets();

  const tint = useThemeColor({}, "tint");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");

  const [securePin, setSecurePin] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const canContinue = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      isValidEmail(email) &&
      phone.trim().length > 0 &&
      pin.trim().length >= 6 &&
      pin === confirmPin &&
      address.trim().length > 0 &&
      identityNumber.trim().length > 0
    );
  }, [
    firstName,
    lastName,
    email,
    phone,
    pin,
    confirmPin,
    address,
    identityNumber,
  ]);

  const onContinue = () => {
    if (!isValidEmail(email)) {
      Alert.alert(t("error"), t("invalidEmail"));
      return;
    }

    if (pin.trim().length < 6) {
      Alert.alert(t("error"), t("pinTooShort"));
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert(t("error"), t("pinMismatch"));
      return;
    }

    const idValue = Number(identityNumber);
    if (!Number.isFinite(idValue)) {
      Alert.alert(t("error"), t("invalidIdNumber"));
      return;
    }

    clear();
    setDetails({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      pin,
      phone: phone.trim(),
      address: address.trim(),
      identityNumber: identityNumber.trim(),
    });

    router.push("/(auth)/id-scan" as any);
  };

  return (
    <ThemedView style={styles.screen}>
      <LanguageSwitch />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(60, insets.bottom + 24) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            entering={FadeInDown.duration(450)}
            style={styles.header}
          >
            <ThemedText style={styles.title}>{t("signUp")}</ThemedText>
            <ThemedText style={styles.brand}>
              {t("appName").toUpperCase()}
            </ThemedText>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(450).delay(80)}
            style={styles.form}
          >
            <AuthInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t("firstName")}
              autoCapitalize="words"
            />
            <AuthInput
              value={lastName}
              onChangeText={setLastName}
              placeholder={t("lastName")}
              autoCapitalize="words"
            />
            <AuthInput
              value={email}
              onChangeText={setEmail}
              placeholder={t("email")}
              keyboardType="email-address"
            />

            <AuthInput
              value={phone}
              onChangeText={setPhone}
              placeholder={t("phone")}
              keyboardType="phone-pad"
            />

            <AuthInput
              value={pin}
              onChangeText={setPin}
              placeholder={t("pin")}
              secureTextEntry={securePin}
              onToggleSecure={() => setSecurePin((s) => !s)}
              keyboardType="number-pad"
            />

            <AuthInput
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder={t("confirmPin")}
              secureTextEntry={secureConfirm}
              onToggleSecure={() => setSecureConfirm((s) => !s)}
              keyboardType="number-pad"
            />

            <AuthInput
              value={address}
              onChangeText={setAddress}
              placeholder={t("address")}
              autoCapitalize="sentences"
            />
            <AuthInput
              value={identityNumber}
              onChangeText={setIdentityNumber}
              placeholder={t("idNumber")}
              keyboardType="number-pad"
            />

            <GradientButton
              label={t("continue")}
              onPress={onContinue}
              disabled={!canContinue}
            />
          </Animated.View>

          <View style={styles.footer}>
            <View
              style={[styles.footerRow, isRtl ? styles.footerRowRtl : null]}
            >
              <ThemedText style={styles.footerMuted}>
                {t("alreadyHaveAccount")}{" "}
              </ThemedText>
              <Link href={"/(auth)/login" as any} style={styles.link}>
                <ThemedText style={[styles.linkText, { color: tint }]}>
                  {t("signIn")}
                </ThemedText>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 88,
    paddingBottom: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 22,
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
    marginTop: 22,
    alignItems: "center",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerRowRtl: {
    flexDirection: "row-reverse",
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
