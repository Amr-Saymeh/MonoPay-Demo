import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  title?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  showBack?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title = 'Exchange',
  onRefresh,
  refreshing = false,
  showBack,
  onBack,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refreshing) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, [refreshing, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContainer}>
        {showBack && onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color="#0f172a" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>

      {onRefresh && (
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <FontAwesome name="refresh" size={22} color="#64748b" />
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
});

export default Header;
