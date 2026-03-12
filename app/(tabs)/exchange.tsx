import { onValue, ref } from 'firebase/database';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import CurrencyListItem from '../../components/exchange/CurrencyListItem';
import Header from '../../components/exchange/Header';
import { getCurrencies, getLatestRates } from '../../servisec/exchageServices/Currency';
import { db } from '../../src/firebaseConfig';
import { useAuth } from '../../src/providers/AuthProvider';

interface RatesData {
  rates: { [key: string]: number };
}

type WalletCard = {
  userWalletKey: string;
  walletid: number;
  name: string;
  emoji?: string;
  color?: string;
};

type CurrencyEntry = {
  code: string;
  balance: number;
};

const normalizeCurrency = (code: string) => {
  if (code === 'NIS') return 'ILS';
  return code;
};

const denormalizeCurrency = (code: string) => {
  if (code === 'ILS') return 'NIS';
  return code;
};

const Exchange: React.FC = () => {
  const { user } = useAuth();

  const [ratesData, setRatesData] = useState<RatesData | null>(null);
  const [currencyNames, setCurrencyNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState('');

  const [wallets, setWallets] = useState<WalletCard[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(true);

  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [walletCurrencies, setWalletCurrencies] = useState<CurrencyEntry[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);



  const baseCurrencyRef = useRef(baseCurrency);
  baseCurrencyRef.current = baseCurrency;

  useEffect(() => {
    getCurrencies().then(setCurrencyNames);
  }, []);

  const fetchRates = useCallback(async (currency: string) => {
    if (!currency) return;

    setLoading(true);
    const latest = await getLatestRates(normalizeCurrency(currency));
    setRatesData(latest);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (baseCurrency) {
      fetchRates(baseCurrency);
    }
  }, [baseCurrency, fetchRates]);

  const handleRefresh = useCallback(() => {
  // refresh exchange rates
  fetchRates(baseCurrency);

  // refresh wallet currencies / balances
  if (selectedWalletId) {
    const walletRef = ref(db, `wallets/wallet${selectedWalletId}/currancies`);

    onValue(
      walletRef,
      (snap) => {
        const data = snap.val();

        if (data) {
          const list = Object.entries(data).map(([code, balance]: any) => ({
            code: code.trim().toUpperCase(),
            balance: Number(balance) || 0,
          }));

          setWalletCurrencies(list);
        }
      },
      { onlyOnce: true }
    );
  }

  // refresh transactions if you have them
  // fetchTransactions();  <-- if you created a transaction listener
}, [baseCurrency, fetchRates, selectedWalletId]);

  useEffect(() => {
    if (!user) return;

    const unsub = onValue(
      ref(db, `users/${user.uid}/userwallet`),
      (snap) => {
        const data = snap.val() || {};

        const list: WalletCard[] = Object.entries(data)
          .map(([key, wallet]: [string, any]) => ({
            userWalletKey: key,
            walletid: Number(wallet?.walletid),
            name: wallet?.name?.trim() || `Wallet ${wallet?.walletid}`,
            emoji: wallet?.emoji?.trim() || '💰',
            color: wallet?.color?.trim(),
          }))
          .filter((w) => Number.isFinite(w.walletid) && w.walletid > 0)
          .sort((a, b) => a.walletid - b.walletid);

        setWallets(list);
        setWalletsLoading(false);

        if (list.length > 0) {
          setSelectedWalletId((prev) => prev ?? list[0].walletid);
        }
      },
      () => {
        setWallets([]);
        setWalletsLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!selectedWalletId) {
      setWalletCurrencies([]);
      return;
    }

    setWalletLoading(true);

    const unsub = onValue(
      ref(db, `wallets/wallet${selectedWalletId}/currancies`),
      (snap) => {
        const data = snap.val();

        if (data && typeof data === 'object') {
          const list: CurrencyEntry[] = Object.entries(data)
            .filter(([k, v]) => k && Number.isFinite(Number(v)))
            .map(([code, balance]: [string, any]) => ({
              code: denormalizeCurrency(code.trim().toUpperCase()),
              balance: Number(balance) || 0,
            }))
            .sort((a, b) => a.code.localeCompare(b.code));

          setWalletCurrencies(list);

          const codes = list.map((c) => c.code);

          if (codes.length > 0 && !codes.includes(baseCurrencyRef.current)) {
            setBaseCurrency(codes[0]);
          }
        } else {
          setWalletCurrencies([]);
        }

        setWalletLoading(false);
      },
      () => {
        setWalletCurrencies([]);
        setWalletLoading(false);
      }
    );

    return () => unsub();
  }, [selectedWalletId]);


const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'ILS', 'JOD', 'EGP'];

const displayEntries = React.useMemo<[string, number][]>(() => {
  if (!ratesData?.rates) return [];

  let entries = Object.entries(ratesData.rates) as [string, number][];

  // only show supported currencies from the API
  entries = entries.filter(([code]) =>
    SUPPORTED_CURRENCIES.includes(code)
  );

  return entries.map(([code, rate]) => [
    denormalizeCurrency(code),
    rate,
  ]);
}, [ratesData, currencyNames]);

  const getBalance = useCallback(
    (code: string): number | undefined =>
      walletCurrencies.find(
        (c) =>
          normalizeCurrency(c.code) === normalizeCurrency(code)
      )?.balance,
    [walletCurrencies]
  );

  if (walletsLoading && wallets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        baseCurrency={baseCurrency}
        onRefresh={handleRefresh}
        refreshing={loading}
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onWalletChange={setSelectedWalletId}
        walletCurrencies={walletCurrencies.map((c) => c.code)}
        onCurrencyChange={setBaseCurrency}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        {walletLoading && (
          <View style={styles.inlineLoader}>
            <ActivityIndicator size="small" color="#6366f1" />
            <Text style={styles.inlineLoaderText}>Loading currencies...</Text>
          </View>
        )}

        {!walletLoading &&
          displayEntries.map(([currency, rate]) => (
            <CurrencyListItem
              key={currency}
              currency={currency}
              rate={rate}
              currencyName={currencyNames[normalizeCurrency(currency)]}
              baseCurrency={baseCurrency}
              balance={getBalance(currency)}
            />
          ))}

        {!walletLoading && displayEntries.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              {walletCurrencies.length === 0
                ? 'This wallet has no currencies yet.'
                : 'No currencies match your search.'}
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
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
  clearButton: {
    marginLeft: 8,
    padding: 8,
  },
  clearText: {
    fontSize: 18,
    color: '#888',
  },
  inlineLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  inlineLoaderText: {
    color: '#888',
    fontSize: 14,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noResultsText: {
    color: '#666',
    fontSize: 16,
  },
});

export default Exchange;