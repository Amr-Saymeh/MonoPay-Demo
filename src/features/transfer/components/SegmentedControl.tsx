import React, { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon: string;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  isRtl?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  isRtl = false,
}: Props<T>) {
  const selectedIndex = options.findIndex((o) => o.value === value);
  const animatedValue = useRef(new Animated.Value(selectedIndex)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: selectedIndex,
      useNativeDriver: false,
      tension: 120,
      friction: 10,
    }).start();
  }, [selectedIndex, animatedValue]);

  const segmentWidth = animatedValue.interpolate({
    inputRange: options.map((_, i) => i),
    outputRange: options.map(() => `${100 / options.length}%`),
  });

  const segmentLeft = animatedValue.interpolate({
    inputRange: options.map((_, i) => i),
    outputRange: options.map((_, i) => `${(i * 100) / options.length}%`),
  });

  return (
    <View className="bg-white/20 rounded-2xl p-1 flex-row">
      {/* Animated pill */}
      <Animated.View
        className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm"
        style={{ width: segmentWidth, left: segmentLeft }}
      />

      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-1 py-3 items-center justify-center flex-row gap-1.5"
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text className="text-base">{option.icon}</Text>
            <Text
              className={`text-sm font-semibold ${
                isActive ? "text-violet-700" : "text-white/80"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
