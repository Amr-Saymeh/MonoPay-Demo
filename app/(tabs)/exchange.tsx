import { FontAwesome } from '@expo/vector-icons';
import { onValue, ref } from 'firebase/database';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getLatestRates } from '../../servisec/exchageServices/Currency';
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

// Currency names
const currencyNames: { [key: string]: string } = {
  USD: 'US Dollar',
  EUR: 'Euro',
  ILS: 'Israeli Shekel',
  NIS: 'Israeli Shekel',
  JOD: 'Jordanian Dinar',
  EGP: 'Egyptian Pound',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
};

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'ILS', 'JOD', 'EGP'];

const Exchange: React.FC = () => {
  const { user } = useAuth();

  const [ratesData, setRatesData] = useState<RatesData | null>(null);
  const [loading, setLoading] = useState(true);

  const [wallets, setWallets] = useState<WalletCard[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(true);

  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [walletCurrencies, setWalletCurrencies] = useState<CurrencyEntry[]>([]);

  // Exchange state
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showFromCurrencyModal, setShowFromCurrencyModal] = useState(false);
  const [showToCurrencyModal, setShowToCurrencyModal] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [exchangeSuccess, setExchangeSuccess] = useState(false);
  const [displayedCurrencyIndex, setDisplayedCurrencyIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateCurrencyChange = useCallback(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim]);

  const selectedWallet = wallets.find((w) => w.walletid === selectedWalletId);

  const totalBalance = useMemo(() => {
    return walletCurrencies.reduce((sum, c) => sum + c.balance, 0);
  }, [walletCurrencies]);

  const getBalance = useCallback(
    (code: string): number => {
      const entry = walletCurrencies.find(
        (c) => normalizeCurrency(c.code) === normalizeCurrency(code)
      );
      return entry?.balance || 0;
    },
    [walletCurrencies]
  );

  const fetchRates = useCallback(async (currency: string) => {
    if (!currency) return;
    setLoading(true);
    const latest = await getLatestRates(normalizeCurrency(currency));
    setRatesData(latest);
    setLoading(false);
  }, []);

  // Reset animation when wallet changes
  useEffect(() => {
    setDisplayedCurrencyIndex(0);
    fadeAnim.setValue(1);
  }, [selectedWalletId, walletCurrencies, fadeAnim]);

  // Fetch rates when fromCurrency changes
  useEffect(() => {
    if (fromCurrency) {
      fetchRates(fromCurrency);
    }
  }, [fromCurrency, fetchRates]);

  // Load wallets
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
            emoji: wallet?.emoji?.trim() || '💳',
            color: wallet?.color?.trim(),
          }))
          .filter((w) => Number.isFinite(w.walletid) && w.walletid > 0)
          .sort((a, b) => a.walletid - b.walletid);

        setWallets(list);
        setWalletsLoading(false);

        if (list.length > 0 && !selectedWalletId) {
          setSelectedWalletId(list[0].walletid);
        }
      },
      () => {
        setWallets([]);
        setWalletsLoading(false);
      }
    );

    return () => unsub();
  }, [user, selectedWalletId]);

  // Load wallet currencies
  useEffect(() => {
    if (!selectedWalletId) {
      setWalletCurrencies([]);
      return;
    }

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

          // Set default from currency to first available
          const supported = list.filter((c) =>
            SUPPORTED_CURRENCIES.includes(normalizeCurrency(c.code))
          );
          if (supported.length > 0 && !fromCurrency) {
            setFromCurrency(supported[0].code);
          }
        } else {
          setWalletCurrencies([]);
        }
      },
      () => {
        setWalletCurrencies([]);
      }
    );

    return () => unsub();
  }, [selectedWalletId, fromCurrency]);

  const currentRate = useMemo(() => {
    if (!ratesData?.rates || !toCurrency) return null;
    const normalizedTo = normalizeCurrency(toCurrency);
    return ratesData.rates[normalizedTo] || null;
  }, [ratesData, toCurrency]);

  const convertedAmount = useMemo(() => {
    if (!currentRate || !amount) return null;
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!Number.isFinite(numAmount)) return null;
    return (numAmount * currentRate).toFixed(2);
  }, [currentRate, amount]);

  const handleSwap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount('');
    setExchangeError(null);
  }, [fromCurrency, toCurrency]);

  const handleMax = useCallback(() => {
    const balance = getBalance(fromCurrency);
    setAmount(balance.toFixed(2));
    setExchangeError(null);
  }, [fromCurrency, getBalance]);

  const handleExchange = useCallback(async () => {
    if (!user || !selectedWalletId || !fromCurrency || !toCurrency) return;

    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setExchangeError('Enter a valid amount');
      return;
    }

    const fromBalance = getBalance(fromCurrency);
    if (numAmount > fromBalance) {
      setExchangeError('Insufficient balance');
      return;
    }

    const rate = currentRate || 0;
    const converted = numAmount * rate;

    const fromKey = denormalizeCurrency(fromCurrency.trim().toUpperCase());
    const toKey = denormalizeCurrency(toCurrency.trim().toUpperCase());

    try {
      const walletRef = ref(db, `wallets/wallet${selectedWalletId}/currancies`);
      const { get, set } = await import('firebase/database');

      const snap = await get(walletRef);
      const raw = (snap.val() ?? {}) as Record<string, number>;

      const merged: Record<string, number> = {};
      for (const [rawCode, rawAmount] of Object.entries(raw)) {
        const normalizedKey = denormalizeCurrency(rawCode.trim().toUpperCase());
        const value = Number(rawAmount);
        if (!Number.isFinite(value)) continue;
        const prev = Number(merged[normalizedKey] ?? 0);
        merged[normalizedKey] = (Number.isFinite(prev) ? prev : 0) + value;
      }

      const toBalance = Number(merged[toKey] ?? 0);
      if (!Number.isFinite(toBalance)) {
        setExchangeError('Target currency not available in wallet');
        return;
      }

      const newFromBalance = Number((fromBalance - numAmount).toFixed(2));
      const newToBalance = Number((toBalance + converted).toFixed(2));

      merged[fromKey] = newFromBalance;
      merged[toKey] = newToBalance;

      await set(walletRef, merged);

      setExchangeSuccess(true);
      setTimeout(() => {
        setExchangeSuccess(false);
        setAmount('');
        setExchangeError(null);
      }, 2000);
    } catch (e) {
      console.error('Exchange failed', e);
      setExchangeError('Failed to perform exchange');
    }
  }, [user, selectedWalletId, fromCurrency, toCurrency, amount, currentRate, getBalance]);

  // Get available "to" currencies (all supported except from)
  const toCurrencies = useMemo(() => {
    return SUPPORTED_CURRENCIES.filter(
      (c) => normalizeCurrency(c) !== normalizeCurrency(fromCurrency)
    );
  }, [fromCurrency]);

  if (walletsLoading || !selectedWallet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exchange</Text>
        <TouchableOpacity onPress={() => setShowWalletModal(true)} style={styles.walletButton}>
          <Text style={styles.walletEmoji}>{selectedWallet?.emoji || '💳'}</Text>
          <Text style={styles.walletName} numberOfLines={1}>
            {selectedWallet?.name || 'Select Wallet'}
          </Text>
          <FontAwesome name="chevron-down" size={12} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Card */}
        <TouchableOpacity
          style={styles.walletCard}
          onPress={() => {
            const nonZeroCurrencies = walletCurrencies.filter((c) => c.balance > 0);
            if (nonZeroCurrencies.length > 0) {
              animateCurrencyChange();
              setDisplayedCurrencyIndex((prev) => (prev + 1) % nonZeroCurrencies.length);
            }
          }}
          activeOpacity={0.9}
        >
          <View style={styles.walletCardHeader}>
            <Text style={styles.walletCardName}>{selectedWallet?.name}</Text>
            <Text style={styles.walletCardEmoji}>{selectedWallet?.emoji || '💳'}</Text>
          </View>
          <Text style={styles.walletBalanceLabel}>Available Balance</Text>
          {(() => {
            const nonZeroCurrencies = walletCurrencies.filter((c) => c.balance > 0);
            if (nonZeroCurrencies.length === 0) {
              return <Text style={styles.walletBalance}>No balances</Text>;
            }
            const currency = nonZeroCurrencies[displayedCurrencyIndex % nonZeroCurrencies.length];
            return (
              <Animated.View style={{ opacity: fadeAnim }}>
                <Text style={styles.walletBalance}>
                  {currency.balance.toFixed(2)}
                </Text>
                <View style={styles.walletCurrencyTag}>
                  <Text style={styles.walletCurrencyText}>{currency.code}</Text>
                </View>
              </Animated.View>
            );
          })()}
        </TouchableOpacity>

        {/* Exchange Card */}
        <View style={styles.exchangeCard}>
          {/* From Section */}
          <View style={styles.currencySection}>
            <Text style={styles.sectionLabel}>From</Text>
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  setExchangeError(null);
                }}
              />
              <TouchableOpacity
                style={styles.currencySelector}
                onPress={() => setShowFromCurrencyModal(true)}
              >
                <Text style={styles.currencyCode}>{fromCurrency}</Text>
                <FontAwesome name="chevron-down" size={12} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceText}>
                Balance: {getBalance(fromCurrency).toFixed(2)}
              </Text>
              <TouchableOpacity onPress={handleMax}>
                <Text style={styles.maxButton}>MAX</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Swap Button */}
          <View style={styles.swapContainer}>
            <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
              <FontAwesome name="exchange" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* To Section */}
          <View style={styles.currencySection}>
            <Text style={styles.sectionLabel}>To</Text>
            <View style={styles.amountRow}>
              <Text style={styles.convertedAmount}>
                {convertedAmount || '0.00'}
              </Text>
              <TouchableOpacity
                style={styles.currencySelector}
                onPress={() => setShowToCurrencyModal(true)}
              >
                <Text style={styles.currencyCode}>{toCurrency}</Text>
                <FontAwesome name="chevron-down" size={12} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceText}>
                Balance: {getBalance(toCurrency).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Rate Info */}
        {currentRate && (
          <View style={styles.rateInfo}>
            <Text style={styles.rateText}>
              1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
            </Text>
          </View>
        )}

        {/* Error */}
        {exchangeError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{exchangeError}</Text>
          </View>
        )}

        {/* Success Message */}
        {exchangeSuccess && (
          <View style={styles.successContainer}>
            <FontAwesome name="check-circle" size={20} color="#22c55e" />
            <Text style={styles.successText}>Exchange successful!</Text>
          </View>
        )}

        {/* Exchange Button */}
        <TouchableOpacity
          style={[
            styles.exchangeButton,
            (!amount || parseFloat(amount) <= 0) && styles.exchangeButtonDisabled,
          ]}
          onPress={handleExchange}
          disabled={!amount || parseFloat(amount) <= 0 || loading}
        >
          <Text style={styles.exchangeButtonText}>Exchange</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Wallet Selection Modal */}
      <Modal
        visible={showWalletModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Wallet</Text>
              <TouchableOpacity onPress={() => setShowWalletModal(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            {wallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.userWalletKey}
                style={[
                  styles.modalOption,
                  wallet.walletid === selectedWalletId && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setSelectedWalletId(wallet.walletid);
                  setShowWalletModal(false);
                }}
              >
                <Text style={styles.modalOptionEmoji}>{wallet.emoji || '💳'}</Text>
                <Text style={styles.modalOptionText}>{wallet.name}</Text>
                {wallet.walletid === selectedWalletId && (
                  <FontAwesome name="check" size={16} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* From Currency Modal */}
      <Modal
        visible={showFromCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFromCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowFromCurrencyModal(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.modalOption,
                  normalizeCurrency(currency) === normalizeCurrency(fromCurrency) &&
                    styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setFromCurrency(currency);
                  setShowFromCurrencyModal(false);
                }}
              >
                <View style={styles.modalOptionInfo}>
                  <Text style={styles.modalOptionText}>{currency}</Text>
                  <Text style={styles.modalOptionSubtext}>
                    {currencyNames[currency]}
                  </Text>
                </View>
                {normalizeCurrency(currency) === normalizeCurrency(fromCurrency) && (
                  <FontAwesome name="check" size={16} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* To Currency Modal */}
      <Modal
        visible={showToCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowToCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowToCurrencyModal(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            {toCurrencies.map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.modalOption,
                  normalizeCurrency(currency) === normalizeCurrency(toCurrency) &&
                    styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setToCurrency(currency);
                  setShowToCurrencyModal(false);
                }}
              >
                <View style={styles.modalOptionInfo}>
                  <Text style={styles.modalOptionText}>{currency}</Text>
                  <Text style={styles.modalOptionSubtext}>
                    {currencyNames[currency]}
                  </Text>
                </View>
                {normalizeCurrency(currency) === normalizeCurrency(toCurrency) && (
                  <FontAwesome name="check" size={16} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  walletEmoji: {
    fontSize: 16,
  },
  walletName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    maxWidth: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Wallet Card
  walletCard: {
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
  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletCardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  walletCardEmoji: {
    fontSize: 32,
  },
  walletBalanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  walletCurrencyTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  walletCurrencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  // Exchange Card
  exchangeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  currencySection: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#64748b',
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
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '600',
    color: '#0f172a',
    padding: 0,
  },
  convertedAmount: {
    flex: 1,
    fontSize: 36,
    fontWeight: '600',
    color: '#0f172a',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    minWidth: 45,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  maxButton: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  // Swap Button
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
  // Rate Info
  rateInfo: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  rateText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  // Error
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  // Success
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
  },
  // Exchange Button
  exchangeButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exchangeButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  exchangeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  modalClose: {
    fontSize: 28,
    color: '#64748b',
    lineHeight: 28,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionSelected: {
    backgroundColor: '#f8fafc',
  },
  modalOptionEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  modalOptionInfo: {
    flex: 1,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  modalOptionSubtext: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
});

export default Exchange;
