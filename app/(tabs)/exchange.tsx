import { onValue, ref } from 'firebase/database';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
  code: string;      // uppercase e.g. 'NIS'
  balance: number;   // e.g. 500
};

const Exchange: React.FC = () => {
  const { user } = useAuth();

  const [ratesData, setRatesData]           = useState<RatesData | null>(null);
  const [currencyNames, setCurrencyNames]   = useState<{ [key: string]: string }>({});
  const [loading, setLoading]               = useState(true);
  const [baseCurrency, setBaseCurrency]     = useState('');

  const [wallets, setWallets]               = useState<WalletCard[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(true);

  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [walletCurrencies, setWalletCurrencies] = useState<CurrencyEntry[]>([]);
  const [walletLoading, setWalletLoading]       = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  // Ref so wallet-currency fetch doesn't depend on baseCurrency → avoids loop
  const baseCurrencyRef = useRef(baseCurrency);
  baseCurrencyRef.current = baseCurrency;

  // ── 1. Fetch currency names (once) ─────────────────────────────────
  useEffect(() => {
    getCurrencies().then(setCurrencyNames);
  }, []);

  // ── 2. Fetch exchange rates whenever baseCurrency changes ───────────
  const fetchRates = useCallback(async (currency: string) => {
    setLoading(true);
    const rates = await getLatestRates(currency);
    setRatesData(rates);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRates(baseCurrency);
  }, [baseCurrency, fetchRates]);

  const handleRefresh = useCallback(() => {
    fetchRates(baseCurrency);
  }, [baseCurrency, fetchRates]);

  // ── 3. Listen to user's wallets (onValue — realtime) ───────────────
  // Same as WalletManagementScreen: users/{uid}/userwallet
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

        // Auto-select first wallet if none selected yet
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

  // ── 4. Listen to selected wallet's currencies (onValue — realtime) ──
  // Path: wallets/wallet{id}/currancies  e.g. wallets/wallet9/currancies
  // Same pattern as WalletManagementScreen
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
              code: code.trim().toUpperCase(), // 'nis' → 'NIS'
              balance: Number(balance) || 0,
            }))
            .sort((a, b) => a.code.localeCompare(b.code));

          setWalletCurrencies(list);

          // Switch baseCurrency if current one isn't in this wallet
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

  // ── Filtered display entries ────────────────────────────────────────
  const displayEntries = React.useMemo(() => {
    if (!ratesData?.rates) return [];

    let entries = Object.entries(ratesData.rates) as [string, number][];

    // Only show currencies that exist in the selected wallet
    if (walletCurrencies.length > 0) {
      const allowed = new Set(walletCurrencies.map((c) => c.code.toUpperCase()));
      entries = entries.filter(([code]) => allowed.has(code.toUpperCase()));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      entries = entries.filter(([code]) => {
        const name = currencyNames[code] || '';
        return code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
      });
    }

    return entries;
  }, [ratesData, currencyNames, searchQuery, walletCurrencies]);

  // Helper: get balance for a given currency code
  const getBalance = useCallback(
    (code: string): number | undefined =>
      walletCurrencies.find((c) => c.code === code.toUpperCase())?.balance,
    [walletCurrencies]
  );

  // ── Initial loading screen ──────────────────────────────────────────
  if (walletsLoading && wallets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  
  console.log('selectedWalletId:', selectedWalletId);
console.log('walletCurrencies:', walletCurrencies);
console.log('displayEntries:', displayEntries);
console.log('ratesData keys sample:', Object.keys(ratesData?.rates || {}).slice(0, 5));

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

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search currencies..."
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        {/* Wallet currencies loading */}
        {walletLoading && (
          <View style={styles.inlineLoader}>
            <ActivityIndicator size="small" color="#6366f1" />
            <Text style={styles.inlineLoaderText}>Loading currencies...</Text>
          </View>
        )}

        {/* Currency rows — each shows rate + wallet balance */}
        {!walletLoading &&
          displayEntries.map(([currency, rate]) => (
            <CurrencyListItem
              key={currency}
              currency={currency}
              rate={rate}
              currencyName={currencyNames[currency]}
              baseCurrency={baseCurrency}
              balance={getBalance(currency)}
            />
          ))}

        {/* Empty states */}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'rgb(243, 244, 246)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgb(243, 244, 246)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
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