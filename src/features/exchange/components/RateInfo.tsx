import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RateInfoProps {
  fromCurrency: string;
  toCurrency: string;
  rate: number | null;
}

export const RateInfo: React.FC<RateInfoProps> = ({ fromCurrency, toCurrency, rate }) => {
  if (!rate) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});
