/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    surface: "rgba(17, 24, 28, 0.03)",
    surfacePressed: "rgba(17, 24, 28, 0.06)",
    border: "rgba(17, 24, 28, 0.10)",
    inputBackground: "rgba(17, 24, 28, 0.06)",
    inputBorder: "rgba(17, 24, 28, 0.10)",
    placeholder: "rgba(17, 24, 28, 0.38)",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    surface: "rgba(236, 237, 238, 0.06)",
    surfacePressed: "rgba(236, 237, 238, 0.10)",
    border: "rgba(236, 237, 238, 0.14)",
    inputBackground: "rgba(236, 237, 238, 0.08)",
    inputBorder: "rgba(236, 237, 238, 0.16)",
    placeholder: "rgba(236, 237, 238, 0.48)",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = {
  sans: "Tajawal_400Regular",
  sansLight: "Tajawal_300Light",
  sansMedium: "Tajawal_500Medium",
  sansBold: "Tajawal_700Bold",
  sansExtraBold: "Tajawal_800ExtraBold",
  sansBlack: "Tajawal_900Black",
  serif: "Tajawal_400Regular",
  rounded: "Tajawal_800ExtraBold",
  mono: "Tajawal_400Regular",
} as const;
