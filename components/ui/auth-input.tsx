import React, { useMemo } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";

export function AuthInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  onToggleSecure,
  autoCapitalize,
  textContentType,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  onToggleSecure?: () => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  textContentType?: any;
}) {
  const { isRtl } = useI18n();
  const backgroundColor = useThemeColor({}, "inputBackground");
  const borderColor = useThemeColor({}, "inputBorder");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholder");
  const iconColor = useThemeColor({}, "icon");

  const showEye = useMemo(
    () => typeof onToggleSecure === "function",
    [onToggleSecure],
  );

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        style={[
          styles.input,
          isRtl ? styles.rtl : null,
          showEye ? styles.withIcon : null,
          { backgroundColor, borderColor, color: textColor },
        ]}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "none"}
        textContentType={textContentType}
      />

      {showEye ? (
        <Pressable onPress={onToggleSecure} style={styles.eye}>
          <MaterialIcons
            name={secureTextEntry ? "visibility-off" : "visibility"}
            size={20}
            color={iconColor}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: Fonts.sans,
  },
  withIcon: {
    paddingRight: 46,
  },
  eye: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  rtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
