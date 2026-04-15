import React from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { hapticTap } from '@/src/utils/haptics';

export function GradientButton({
  label,
  onPress,
  disabled,
  loading,
  style,
  iconName,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  iconName?: keyof typeof MaterialIcons.glyphMap;
}) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      disabled={isDisabled}
      onPressIn={() => {
        if (!isDisabled) hapticTap();
      }}
      onPress={onPress}
      style={({ pressed }) => [style, isDisabled ? styles.disabled : null, pressed ? styles.pressed : null]}>
      <LinearGradient
        colors={['#8B5CF6', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.contentRow}>
            {iconName ? <MaterialIcons name={iconName} size={18} color="#FFFFFF" /> : null}
            <ThemedText type="defaultSemiBold" style={styles.label}>{label}</ThemedText>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 16,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
