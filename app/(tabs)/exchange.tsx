import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import CurrencyListItem from '../../components/exchange/CurrencyListItem';
import Header from '../../components/exchange/Header';
import { getCurrencies, getLatestRates } from '../../servisec/exchageServices/Currency';

interface RatesData {
  rates: { [key: string]: number };
}

const Exchange = () => {
  const [ratesData, setRatesData] = useState<RatesData | null>(null);
  const [currencyNames, setCurrencyNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [refreshToken, setRefreshToken] = useState(0);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    const names = await getCurrencies();
    setCurrencyNames(names);
    const rates = await getLatestRates(baseCurrency);
    setRatesData(rates);
    setLoading(false);
  }, [baseCurrency]);

  const handleRefresh = useCallback(async () => {
      setLoading(true);
      const rates = await getLatestRates(baseCurrency);
      setRatesData(rates);
      setRefreshToken(prev => prev + 1); // Force re-render
      setLoading(false);
  }, [baseCurrency]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  if (loading && !ratesData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header baseCurrency={baseCurrency} onRefresh={handleRefresh} refreshing={loading} />

      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
      >
        {ratesData && ratesData.rates && Object.entries(ratesData.rates).map(([currency, rate]) => (
          <CurrencyListItem
            key={`${currency}-${refreshToken}`}
            currency={currency}
            rate={rate as number}
            currencyName={currencyNames[currency]}
            baseCurrency={baseCurrency}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

export default Exchange;
