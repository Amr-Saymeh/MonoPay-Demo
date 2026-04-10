import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ExchangeCardProps {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  convertedAmount: string | null;
  fromBalance: number;
  toBalance: number;
  onAmountChange: (value: string) => void;
  onFromCurrencyPress: () => void;
  onToCurrencyPress: () => void;
  onSwap: () => void;
  onMax: () => void;
}

export const ExchangeCard: React.FC<ExchangeCardProps> = ({
  fromCurrency,
  toCurrency,
  amount,
  convertedAmount,
  fromBalance,
  toBalance,
  onAmountChange,
  onFromCurrencyPress,
  onToCurrencyPress,
  onSwap,
  onMax,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* From Section */}
      <View style={styles.section}>
        <ThemedText style={[styles.label, { color: iconColor }]}>From</ThemedText>
        <View style={styles.amountRow}>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="0.00"
            placeholderTextColor={placeholderColor}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={onAmountChange}
          />
          <TouchableOpacity style={[styles.selector, { backgroundColor: surfaceColor }]} onPress={onFromCurrencyPress}>
            <ThemedText style={styles.code}>{fromCurrency}</ThemedText>
            <FontAwesome name="chevron-down" size={12} color={iconColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.balanceRow}>
          <ThemedText style={[styles.balance, { color: iconColor }]}>Balance: {fromBalance.toFixed(2)}</ThemedText>
          <TouchableOpacity onPress={onMax}>
            <ThemedText style={[styles.maxButton, { color: tintColor }]}>MAX</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Swap Button */}
      <View style={styles.swapContainer}>
        <TouchableOpacity style={styles.swapButton} onPress={onSwap}>
          <FontAwesome name="exchange" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* To Section */}
      <View style={styles.section}>
        <ThemedText style={[styles.label, { color: iconColor }]}>To</ThemedText>
        <View style={styles.amountRow}>
          <ThemedText style={[styles.output, { color: textColor }]}>{convertedAmount || '0.00'}</ThemedText>
          <TouchableOpacity style={[styles.selector, { backgroundColor: surfaceColor }]} onPress={onToCurrencyPress}>
            <ThemedText style={styles.code}>{toCurrency}</ThemedText>
            <FontAwesome name="chevron-down" size={12} color={iconColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.balanceRow}>
          <ThemedText style={[styles.balance, { color: iconColor }]}>Balance: {toBalance.toFixed(2)}</ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 36,
    fontWeight: '600',
    padding: 0,
  },
  output: {
    flex: 1,
    fontSize: 36,
    fontWeight: '600',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  code: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 45,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balance: {
    fontSize: 13,
  },
  maxButton: {
    fontSize: 13,
    fontWeight: '600',
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  swapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
