import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";

export default function TabLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: {
          fontFamily: Fonts.sans,
          fontSize: 12,
        },
        tabBarBadgeStyle: {
          fontFamily: Fonts.sansBold,
          backgroundColor: "#ff4444",
          color: "#fff",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="approve-users"
        options={{
          title: t("approve"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.crop.circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape" color={color} />
          ),
        }}
      />
      <Tabs.Screen name="create" options={{ href: null }} />
      <Tabs.Screen name="goals" options={{ href: null }} />
      <Tabs.Screen name="income-savings" options={{ href: null }} />
      <Tabs.Screen name="wallets" options={{ href: null }} />
    </Tabs>
  );
}
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#6e5da9ff",
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    height: 70,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  }
});
