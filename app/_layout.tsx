import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

import {
  Tajawal_200ExtraLight,
  Tajawal_300Light,
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
  Tajawal_900Black,
  useFonts,
} from "@expo-google-fonts/tajawal";

import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/src/providers/AuthProvider";
import { FeaturesProvider } from "@/src/providers/FeaturesProvider";
import { LanguageProvider } from "@/src/providers/LanguageProvider";
import { SignupFlowProvider } from "@/src/providers/SignupFlowProvider";
import {
  ThemeModeProvider,
  useThemeMode,
} from "@/src/providers/ThemeModeProvider";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const unstable_settings = {
  anchor: "index",
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
    },
  },
});

function RootLayoutInner() {
  const { colorScheme } = useThemeMode();

  const [fontsLoaded] = useFonts({
    Tajawal_200ExtraLight,
    Tajawal_300Light,
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
    Tajawal_900Black,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    const RNText = Text as any;
    RNText.defaultProps = {
      ...(RNText.defaultProps || {}),
      style: {
        ...(RNText.defaultProps?.style || {}),
        fontFamily: "Tajawal_400Regular",
      },
    };

    const RNTextInput = TextInput as any;
    RNTextInput.defaultProps = {
      ...(RNTextInput.defaultProps || {}),
      style: {
        ...(RNTextInput.defaultProps?.style || {}),
        fontFamily: "Tajawal_400Regular",
      },
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            animation: "slide_from_right",
            headerTitleStyle: { fontFamily: "Tajawal_700Bold" },
            headerBackTitleStyle: { fontFamily: "Tajawal_400Regular" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="(auth)"
            options={{
              gestureEnabled: false,
              fullScreenGestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="category-suggestions"
            options={{
              gestureEnabled: false,
              fullScreenGestureEnabled: false,
            }}
          />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeModeProvider>
            <LanguageProvider>
              <AuthProvider>
                <SignupFlowProvider>
                  <FeaturesProvider>
                    <RootLayoutInner />
                  </FeaturesProvider>
                </SignupFlowProvider>
              </AuthProvider>
            </LanguageProvider>
          </ThemeModeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}