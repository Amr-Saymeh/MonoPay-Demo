import React from "react";

import { Stack } from "expo-router";

import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";

export default function SettingsLayout() {
  const { t } = useI18n();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          fontFamily: Fonts.sansBold,
        },
        headerBackTitleStyle: {
          fontFamily: Fonts.sans,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: t("settings") }} />
      <Stack.Screen name="edit-profile" options={{ title: t("editProfile") }} />
      <Stack.Screen
        name="change-password"
        options={{ title: t("changePassword") }}
      />
      <Stack.Screen
        name="avatar-camera"
        options={{ title: t("retakePhoto") }}
      />
    </Stack>
  );
}
