import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, onValue } from 'firebase/database';
import { db } from '@/src/firebaseConfig';
import { STORAGE, CURRENCIES, CURRENCY_SYMBOL } from '../constants';
import { Currency } from '../types';
import { useCurrencyRates } from './useCurrencyRates';

export function useDailyTotal() {
  const { rates, loading: ratesLoading, hasError: ratesError, toNIS, fromNIS, refresh } = useCurrencyRates();

  const [totalSpentNIS, setTotalSpentNIS] = useState(0);
  const [dailyBudgetNIS, setDailyBudgetNIS] = useState(250);
  const [dataLoading, setDataLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState<Currency>('NIS');

  useEffect(() => {
    (async () => {
      const [budget, currency] = await Promise.all([
        AsyncStorage.getItem(STORAGE.budget),
        AsyncStorage.getItem(STORAGE.currency),
      ]);
      if (budget) setDailyBudgetNIS(parseFloat(budget));
      if (currency) setDisplayCurrency(currency as Currency);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'purchases'), (snapshot) => {
      if (!snapshot.exists()) {
        setTotalSpentNIS(0);
        setDataLoading(false);
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      let totalNIS = 0;
      snapshot.forEach((child) => {
        const item = child.val();
        const itemDate = item.createdAt?.split('T')[0];
        if (itemDate === today) {
          const currency = (item.currency as Currency) ?? 'NIS';
          totalNIS += toNIS(item.amount ?? 0, currency);
        }
      });
      setTotalSpentNIS(totalNIS);
      setDataLoading(false);
    });
    return () => unsubscribe();
  }, [toNIS]);

  const saveBudget = async (amountNIS: number) => {
    await AsyncStorage.setItem(STORAGE.budget, amountNIS.toString());
    setDailyBudgetNIS(amountNIS);
  };

  const cycleCurrency = async () => {
    const nextIndex = (CURRENCIES.indexOf(displayCurrency) + 1) % CURRENCIES.length;
    const next = CURRENCIES[nextIndex];
    setDisplayCurrency(next);
    await AsyncStorage.setItem(STORAGE.currency, next);
  };

  return {
    totalSpentNIS,
    dailyBudgetNIS,
    displayCurrency,
    dataLoading,
    ratesLoading,
    ratesError,
    rates,
    fromNIS,
    refreshRates: refresh,
    saveBudget,
    cycleCurrency,
    symbol: CURRENCY_SYMBOL[displayCurrency],
  };
}
