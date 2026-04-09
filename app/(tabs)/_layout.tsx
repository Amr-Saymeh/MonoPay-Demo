import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";

import { onValue, ref } from "firebase/database";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/hooks/use-i18n";
import { db } from "../../src/firebaseConfig";

type UserPreview = {
  type?: number;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useI18n();
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  const usersRef = useMemo(() => ref(db, "users"), []);

  useEffect(() => {
    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const data = (snapshot.val() ?? {}) as Record<string, UserPreview>;
        const count = Object.values(data).filter(
          (u) => Number(u?.type) === 0,
        ).length;
        setPendingUsersCount(count);
      },
      () => {
        setPendingUsersCount(0);
      },
    );

    return () => unsubscribe();
  }, [usersRef]);

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
        name="explore"
        options={{
          title: t("explore"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallets"
        options={{
          title: t("wallets"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="creditcard" color={color} />
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
          tabBarBadge: pendingUsersCount > 0 ? pendingUsersCount : undefined,
        }}
      />

      <Tabs.Screen
        name="transfer"
        options={{
          title: t("transfer"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="arrow.left.arrow.right" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
          tabBarIcon: ({color }) => (
            <IconSymbol size={28} name="gearshape" color={color} />
          ),
        }}
      />

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
