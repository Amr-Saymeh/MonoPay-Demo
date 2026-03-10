import React, { useMemo, useState } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/src/providers/AuthProvider";
import { useThemeMode } from "@/src/providers/ThemeModeProvider";

function Row({
  icon,
  label,
  value,
  right,
  onPress,
  destructive,
  disabled,
  iconColor,
  chevronColor,
  pressedColor,
  separatorColor,
  iconBg,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  iconColor: string;
  chevronColor: string;
  pressedColor: string;
  separatorColor: string;
  iconBg: string;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderTopColor: separatorColor },
        pressed && onPress ? { backgroundColor: pressedColor } : null,
        disabled ? styles.rowDisabled : null,
      ]}
    >
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: iconBg },
            destructive ? styles.iconWrapDanger : null,
          ]}
        >
          <MaterialIcons
            name={icon}
            size={18}
            color={destructive ? "#dc2626" : iconColor}
          />
        </View>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.rowLabel, destructive ? styles.danger : null]}
        >
          {label}
        </ThemedText>
      </View>

      <View style={styles.rowRight}>
        {typeof value === "string" ? (
          <ThemedText style={styles.rowValue}>{value}</ThemedText>
        ) : null}
        {right}
        {onPress ? (
          <MaterialIcons name="chevron-right" size={20} color={chevronColor} />
        ) : null}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { t, language, setLanguage } = useI18n();
  const router = useRouter();
  const { user, profile, signOut, signingOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { colorScheme, setMode } = useThemeMode();

  const border = useThemeColor({}, "border");
  const surface = useThemeColor({}, "surface");
  const surfacePressed = useThemeColor({}, "surfacePressed");
  const iconColor = useThemeColor({}, "icon");
  const chevronColor = useThemeColor(
    { light: "rgba(17, 24, 28, 0.45)", dark: "rgba(236, 237, 238, 0.55)" },
    "icon",
  );
  const separatorColor = useThemeColor(
    { light: "rgba(17,24,28,0.06)", dark: "rgba(236,237,238,0.12)" },
    "border",
  );
  const iconBg = useThemeColor(
    { light: "rgba(255,255,255,0.8)", dark: "rgba(236,237,238,0.10)" },
    "surface",
  );

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const name = profile?.name ?? "";
  const email = user?.email ?? profile?.email ?? "";
  const avatarUri = profile?.personalImage;

  const languageLabel = useMemo(
    () => (language === "ar" ? "العربية" : "English"),
    [language],
  );

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  const isDark = colorScheme === "dark";
  const toggleDarkMode = () => {
    setMode(isDark ? "light" : "dark");
  };

  const onLogout = () => {
    Alert.alert(t("logoutConfirmTitle"), t("logoutConfirmMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } finally {
            router.replace("/(auth)/login" as any);
          }
        },
      },
    ]);
  };

  return (
    <ThemedView
      style={[
        styles.screen,
        { paddingBottom: Math.max(16, insets.bottom + 16) },
      ]}
    >
      <View
        style={[styles.card, { borderColor: border, backgroundColor: surface }]}
      >
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.avatarWrap}>
              {typeof avatarUri === "string" && avatarUri.trim().length > 0 ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
            </View>

            <View style={styles.headerText}>
              <ThemedText
                type="subtitle"
                style={{ fontFamily: Fonts.sansBlack, color: "#fff" }}
                numberOfLines={1}
              >
                {name || "—"}
              </ThemedText>
              <ThemedText style={{ color: "rgba(255,255,255,0.85)" }}>
                {email || "—"}
              </ThemedText>
              <Pressable
                onPress={() =>
                  router.push("/(tabs)/settings/edit-profile" as any)
                }
                style={({ pressed }) => [
                  styles.editLink,
                  pressed ? styles.pressed : null,
                ]}
              >
                <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
                  {t("editProfile")}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("account")}</ThemedText>
          <View
            style={[
              styles.group,
              { backgroundColor: surface, borderColor: border },
            ]}
          >
            <Row
              icon="credit-card"
              label={t("paymentMethods")}
              value=""

              onPress={() => router.push("/(tabs)/wallets" as any)}
              iconColor={iconColor}
              chevronColor={chevronColor}
              pressedColor={surfacePressed}
              separatorColor={separatorColor}
              iconBg={iconBg}

            />
            <Row
              icon="language"
              label="Language"
              value={languageLabel}
              onPress={toggleLanguage}
              iconColor={iconColor}
              chevronColor={chevronColor}
              pressedColor={surfacePressed}
              separatorColor={separatorColor}
              iconBg={iconBg}
            />
          </View>
        </View>

        <View style={[styles.section, { paddingBottom: 16 }]}>
          <ThemedText style={styles.sectionTitle}>
            {t("preferences")}
          </ThemedText>
          <View
            style={[
              styles.group,
              { backgroundColor: surface, borderColor: border },
            ]}
          >
            <Row
              icon="notifications-none"
              label={t("notifications")}
              right={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
              }
              onPress={() => setNotificationsEnabled((v) => !v)}
              iconColor={iconColor}
              chevronColor={chevronColor}
              pressedColor={surfacePressed}
              separatorColor={separatorColor}
              iconBg={iconBg}
            />

            <Row
              icon="dark-mode"
              label={t("darkMode")}
              right={<Switch value={isDark} onValueChange={toggleDarkMode} />}
              onPress={toggleDarkMode}
              iconColor={iconColor}
              chevronColor={chevronColor}
              pressedColor={surfacePressed}
              separatorColor={separatorColor}
              iconBg={iconBg}
            />

            <Row
              icon="lock-outline"
              label={t("securityPrivacy")}
              onPress={() =>
                router.push("/(tabs)/settings/change-password" as any)
              }
              iconColor={iconColor}
              chevronColor={chevronColor}
              pressedColor={surfacePressed}
              separatorColor={separatorColor}
              iconBg={iconBg}
            />
            <Row
              icon="logout"
              label={t("logout")}
              destructive
              disabled={!user || signingOut}
              onPress={onLogout}
              iconColor={iconColor}
              chevronColor={chevronColor}
              pressedColor={surfacePressed}
              separatorColor={separatorColor}
              iconBg={iconBg}
            />
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
  },
  headerGradient: {
    backgroundColor: "#7C3AED",
  },
  headerContent: {
    padding: 18,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.55)",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  editLink: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    opacity: 0.65,
    marginBottom: 10,
    fontFamily: Fonts.sansBold,
  },
  group: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDanger: {
    backgroundColor: "rgba(220,38,38,0.08)",
  },
  rowLabel: {
    flex: 1,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowValue: {
    opacity: 0.65,
  },
  danger: {
    color: "#dc2626",
  },
  pressed: {
    opacity: 0.9,
  },
});
