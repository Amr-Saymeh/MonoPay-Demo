import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  baseCurrency: string;
  onRefresh: () => void;
  refreshing: boolean;
}

const Header: React.FC<HeaderProps> = ({ baseCurrency, onRefresh, refreshing }) => {
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
      <View style={styles.topRow}>
        <Text style={styles.title}>Exchange Rates</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <FontAwesome name="refresh" size={24} color="black" />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <View style={styles.currencySelector}>
        <View style={styles.currencySelectorInner}>
          <Text style={styles.baseCurrencyText}>{baseCurrency}</Text>
          <FontAwesome name="chevron-down" size={16} color="black" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    headerContainer: {
        padding: 16,
        paddingTop: 64,
        backgroundColor: '#fff',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: '#000',
        fontSize: 24,
        fontWeight: 'bold',
    },
    currencySelector: {
        marginTop: 16,
    },
    currencySelectorInner: {
        backgroundColor: '#f3f4f6', // gray-100
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    baseCurrencyText: {
        color: '#000',
        fontSize: 18,
    },
});

export default Header;
