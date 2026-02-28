import React, { useEffect } from "react";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

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
import { LanguageProvider } from "@/src/providers/LanguageProvider";
import { SignupFlowProvider } from "@/src/providers/SignupFlowProvider";
import {
  ThemeModeProvider,
  useThemeMode,
} from "@/src/providers/ThemeModeProvider";

export const unstable_settings = {
  anchor: "index",
};

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
    RNText.defaultProps = RNText.defaultProps || {};
    RNText.defaultProps.style = RNText.defaultProps.style || {};
    RNText.defaultProps.style.fontFamily = "Tajawal_400Regular";

    const RNTextInput = TextInput as any;
    RNTextInput.defaultProps = RNTextInput.defaultProps || {};
    RNTextInput.defaultProps.style = RNTextInput.defaultProps.style || {};
    RNTextInput.defaultProps.style.fontFamily = "Tajawal_400Regular";
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator />
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
            headerTitleStyle: { fontFamily: "Tajawal_700Bold" },
            headerBackTitleStyle: { fontFamily: "Tajawal_400Regular" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
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
    <SafeAreaProvider>
      <ThemeModeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SignupFlowProvider>
              <RootLayoutInner />
            </SignupFlowProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeModeProvider>
    </SafeAreaProvider>
  );
}
