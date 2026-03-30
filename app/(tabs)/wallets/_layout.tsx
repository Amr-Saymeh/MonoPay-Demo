import React from "react";

import { Stack } from "expo-router";

import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";

export default function WalletsLayout() {
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
      <Stack.Screen name="index" options={{ title: t("myWallets") }} />
      <Stack.Screen name="add" options={{ title: t("addWallet") }} />
      <Stack.Screen name="shared" options={{ title: "Shared wallet" }} />
    </Stack>
  );
}
