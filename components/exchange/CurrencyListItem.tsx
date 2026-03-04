
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CurrencyListItemProps {
  currency: string;
  rate: number;
  currencyName: string;
  baseCurrency: string;
}

const CurrencyListItem: React.FC<CurrencyListItemProps> = ({ currency, rate, currencyName, baseCurrency }) => {
  const percentageChange = (Math.random() * 2).toFixed(2);
  const isPositive = Math.random() > 0.5;

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{currency}</Text>
        </View>
        <View>
          <Text style={styles.currencyName}>{currencyName || currency}</Text>
          <Text style={styles.baseCurrencyText}>1 {baseCurrency}</Text>
        </View>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.rateText}>{rate.toFixed(2)}</Text>
        <Text style={isPositive ? styles.positiveText : styles.negativeText}>
          {isPositive ? '+' : '-'}
          {percentageChange}%
        </Text>
      </View>
    </View>
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
        borderBottomColor: '#e5e7eb', // gray-200
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
        backgroundColor: '#6366f1', // indigo-500
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    currencyName: {
        color: '#000',
        fontSize: 18,
        fontWeight: '600',
    },
    baseCurrencyText: {
        color: '#6b7280', // gray-500
    },
    rightContainer: {
        alignItems: 'flex-end',
    },
    rateText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '600',
    },
    positiveText: {
        color: '#22c55e', // green-500
    },
    negativeText: {
        color: '#ef4444', // red-500
    },
});

export default CurrencyListItem;
