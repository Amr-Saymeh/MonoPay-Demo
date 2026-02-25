import React, { useMemo } from "react";

import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";

export function LanguageSwitch({ style }: { style?: any }) {
  const { language, setLanguage } = useI18n();
  const insets = useSafeAreaInsets();

  const next = useMemo(() => (language === "en" ? "ar" : "en"), [language]);

  return (
    <View style={[styles.container, { top: 12 + insets.top }, style]}>
      <Pressable
        onPress={() => setLanguage(next)}
        style={({ pressed }) => [styles.pill, pressed ? styles.pressed : null]}
      >
        <ThemedText type="defaultSemiBold" style={styles.label}>
          {language === "en" ? "EN" : "AR"}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    zIndex: 20,
  },
  pill: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 24, 28, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 28, 0.08)",
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 13,
  },
});
