import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { CurrencyEntry } from '../hooks/useWalletCurrencies';

interface WalletCardProps {
  name: string;
  emoji?: string;
  currencies: CurrencyEntry[];
  onCurrencyChange?: () => void;
}

const ANIMATION_DURATION = 150;

export const WalletCard: React.FC<WalletCardProps> = ({
  name,
  emoji,
  currencies,
  onCurrencyChange,
}) => {
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const nonZeroCurrencies = useMemo(
    () => currencies.filter((c) => c.balance > 0),
    [currencies]
  );

  useEffect(() => {
    setDisplayedIndex(0);
    fadeAnim.setValue(1);
  }, [currencies, fadeAnim]);

  const handlePress = useCallback(() => {
    if (nonZeroCurrencies.length <= 1) return;

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setDisplayedIndex((prev) => (prev + 1) % nonZeroCurrencies.length);
      onCurrencyChange?.();
    }, ANIMATION_DURATION);
  }, [nonZeroCurrencies.length, fadeAnim, onCurrencyChange]);

  const displayedCurrency = nonZeroCurrencies[displayedIndex % nonZeroCurrencies.length];

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.emoji}>{emoji || '💳'}</Text>
      </View>
      <Text style={styles.label}>Available Balance</Text>
      {nonZeroCurrencies.length === 0 ? (
        <Text style={styles.balance}>No balances</Text>
      ) : displayedCurrency ? (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.balance}>{displayedCurrency.balance.toFixed(2)}</Text>
          <View style={styles.currencyTag}>
            <Text style={styles.currencyText}>{displayedCurrency.code}</Text>
          </View>
        </Animated.View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  emoji: {
    fontSize: 32,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  balance: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  currencyTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});
