import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CurrencyListItemProps {
  currency: string;
  rate: number;
  currencyName: string;
  baseCurrency: string;
  balance?: number;
  onPress?: () => void;
}

const CurrencyListItem: React.FC<CurrencyListItemProps> = ({
  currency,
  rate,
  currencyName,
  baseCurrency,
  balance,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.leftContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{currency}</Text>
        </View>
        <View>
          <Text style={styles.currencyName} numberOfLines={1}>
            {currencyName || currency}
          </Text>
          <Text style={styles.baseCurrencyText}>
            1 {baseCurrency} = {rate.toFixed(4)} {currency}
          </Text>
        </View>
      </View>

      <View style={styles.rightContainer}>
        <Text style={styles.rateText}>{rate.toFixed(2)}</Text>
        {balance !== undefined && (
          <Text style={styles.balanceText}>
            {balance.toFixed(2)} {currency}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  currencyName: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    maxWidth: 160,
  },
  baseCurrencyText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  rateText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  balanceText: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 2,
    fontWeight: '500',
  },
});

export default CurrencyListItem;