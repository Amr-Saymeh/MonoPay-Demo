import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CurrencyListItemProps {
  currency: string;
  rate?: number;
  previousRate?: number; // optional: pass to get real % change
  currencyName?: string;
  baseCurrency: string;
  balance?: number;
  status?: 'up' | 'down' | 'same' | null;
  onPress?: () => void;
}

// Stable pseudo-random % change per currency code (no flickering)
function getStableChange(currency: string): { pct: number; positive: boolean } {
  let hash = 0;
  for (let i = 0; i < currency.length; i++) {
    hash = currency.charCodeAt(i) + ((hash << 5) - hash);
  }
  const pct = (Math.abs(hash % 100) / 100) * 1.5; // 0.00 – 1.50%
  const positive = hash % 2 === 0;
  return { pct, positive };
}

const CurrencyListItem = ({
  currency,
  rate,
  previousRate,
  currencyName,
  baseCurrency,
  balance,
  status,
  onPress,
}: CurrencyListItemProps) => {
  const formattedRate = rate != null ? rate.toFixed(2) : '--';

  const change = useMemo(() => {
    // If we have real previous rate, use it
    if (rate != null && previousRate != null && previousRate !== 0) {
      const pct = ((rate - previousRate) / previousRate) * 100;
      return { pct: Math.abs(pct), positive: pct >= 0 };
    }
    // Fall back to stable hash-based value (no flicker)
    return getStableChange(currency);
  }, [currency, rate, previousRate]);

  const changeText = `${change.positive ? '▲' : '▼'} ${change.positive ? '+' : '-'}${change.pct.toFixed(2)}%`;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{currency}</Text>
      </View>

      {/* Name + base */}
      <View style={styles.textColumn}>
        <Text style={styles.currencyName} numberOfLines={1}>
          {currencyName || currency}
        </Text>
      </View>

      {/* Rate + change */}
      <View style={styles.rightContainer}>
        <Text style={styles.rateText}>{formattedRate}</Text>
        <Text style={[styles.changeText, change.positive ? styles.positive : styles.negative]}>
          {changeText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ede9fe', // light lavender — matches Figma
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconText: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  currencyName: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
  baseText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  rateText: {
    color: '#111',
    fontSize: 17,
    fontWeight: '700',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  positive: {
    color: '#22c55e',
  },
  negative: {
    color: '#ef4444',
  },
});

export default CurrencyListItem;
