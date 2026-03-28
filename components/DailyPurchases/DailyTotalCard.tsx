import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, TextInput, Alert, I18nManager, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ref, onValue } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@/src/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// ─────────────────────────────────────────────────────────────
// Config & Types
// ─────────────────────────────────────────────────────────────

const THEME = {
  primary:      '#7C4DFF',
  primaryLight: '#a77ffdff',
  success:      '#00C853',
  warning:      '#FFB300',
  danger:       '#FF5252',
};

const STORAGE = {
  budget:   '@daily_budget_nis',
  currency: '@display_currency',
  rates:    '@cached_rates',
  ratesTs:  '@cached_rates_ts',
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

type Currency = 'NIS' | 'USD' | 'JOD';

const CURRENCIES: Currency[] = ['NIS', 'USD', 'JOD'];

const CURRENCY_SYMBOL: Record<Currency, string> = {
  NIS: '₪',
  USD: '$',
  JOD: 'JD',
};

type Rates = Record<Currency, number>;

const FALLBACK_RATES: Rates = { NIS: 1, USD: 3.7, JOD: 5.2 };

// ─────────────────────────────────────────────────────────────
// Currency Rates Hook
// ─────────────────────────────────────────────────────────────

function useCurrencyRates() {
  const [rates,    setRates]    = useState<Rates>(FALLBACK_RATES);
  const [loading,  setLoading]  = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchRates = useCallback(async (force = false) => {
    setLoading(true);
    setHasError(false);
    try {
      if (!force) {
        const ts    = await AsyncStorage.getItem(STORAGE.ratesTs);
        const cache = await AsyncStorage.getItem(STORAGE.rates);
        if (ts && cache && Date.now() - parseInt(ts) < CACHE_TTL_MS) {
          setRates(JSON.parse(cache));
          setLoading(false);
          return;
        }
      }

      const res  = await fetch('https://open.er-api.com/v6/latest/ILS');
      const json = await res.json();

      if (json.result !== 'success') throw new Error('API error');

      const newRates: Rates = {
        NIS: 1,
        USD: 1 / json.rates['USD'],
        JOD: 1 / json.rates['JOD'],
      };

      await AsyncStorage.setItem(STORAGE.rates,   JSON.stringify(newRates));
      await AsyncStorage.setItem(STORAGE.ratesTs, Date.now().toString());
      setRates(newRates);

    } catch {
      const cache = await AsyncStorage.getItem(STORAGE.rates);
      if (cache) setRates(JSON.parse(cache));
      else       setHasError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, []);

  const toNIS = useCallback(
    (amount: number, currency: Currency) => amount * (rates[currency] || FALLBACK_RATES[currency]),
    [rates],
  );

  const fromNIS = useCallback(
    (amountNIS: number, currency: Currency) => {
      const rate = rates[currency] || FALLBACK_RATES[currency];
      return currency === 'NIS' ? amountNIS : amountNIS / rate;
    },
    [rates],
  );

  return { rates, loading, hasError, toNIS, fromNIS, refresh: () => fetchRates(true) };
}

// ─────────────────────────────────────────────────────────────
// Sub-component: Rates Info Modal
// ─────────────────────────────────────────────────────────────

function RatesModal({ visible, onClose, rates, loading, hasError, onRefresh }: {
  visible: boolean; onClose: () => void;
  rates: Rates; loading: boolean; hasError: boolean; onRefresh: () => void;
}) {
  const { t } = useI18n();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={ratesStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={ratesStyles.sheet}>
          <View style={ratesStyles.handle} />
          <Text style={ratesStyles.title}>📊 {t('exchangeRates' as any)}</Text>
          <Text style={ratesStyles.sub}>open.er-api.com · {t('updatedEveryHour' as any)}</Text>

          {loading ? (
            <ActivityIndicator color={THEME.primary} style={{ marginVertical: 24 }} />
          ) : hasError ? (
            <View style={ratesStyles.errorBox}>
              <Text style={ratesStyles.errorText}>⚠️ {t('errorFetchingRates' as any)}</Text>
            </View>
          ) : (
            <View style={ratesStyles.grid}>
              <View style={ratesStyles.card}>
                <Text style={ratesStyles.flag}>🇺🇸</Text>
                <Text style={ratesStyles.pair}>1 USD</Text>
                <Text style={ratesStyles.value}>= ₪{rates.USD?.toFixed(3) || '0.000'}</Text>
              </View>
              <View style={ratesStyles.card}>
                <Text style={ratesStyles.flag}>🇯🇴</Text>
                <Text style={ratesStyles.pair}>1 JOD</Text>
                <Text style={ratesStyles.value}>= ₪{rates.JOD?.toFixed(3) || '0.000'}</Text>
              </View>
              <View style={ratesStyles.card}>
                <Text style={ratesStyles.flag}>🇵🇸</Text>
                <Text style={ratesStyles.pair}>1 NIS</Text>
                <Text style={ratesStyles.value}>= ${rates.USD ? (1 / rates.USD).toFixed(4) : '0.0000'}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={ratesStyles.refreshBtn} onPress={onRefresh}>
            <Text style={ratesStyles.refreshText}>🔄 {t('refreshNow' as any)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ratesStyles.closeBtn} onPress={onClose}>
            <Text style={ratesStyles.closeText}>{t('close' as any)}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-component: Budget Modal
// ─────────────────────────────────────────────────────────────

function BudgetModal({ visible, onClose, onSave, rates }: {
  visible: boolean; onClose: () => void;
  onSave: (amountNIS: number) => void; rates: Rates;
}) {
  const { t } = useI18n();
  const [amount,          setAmount]          = useState('');
  const [inputCurrency,   setInputCurrency]   = useState<Currency>('NIS');

  const previewNIS = (() => {
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return null;
    const rate = rates[inputCurrency] || FALLBACK_RATES[inputCurrency];
    return n * rate;
  })();

  const handleSave = () => {
    if (!previewNIS) {
      Alert.alert(t('error' as any), t('enterValidAmount' as any));
      return;
    }
    onSave(previewNIS);
    setAmount('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={budgetStyles.overlay}>
        <View style={budgetStyles.card}>
          <Text style={budgetStyles.title}>💰 {t('dailyBudget' as any)}</Text>
          <Text style={budgetStyles.sub}>{t('enterAmountInAnyCurrency' as any)}</Text>

          <View style={budgetStyles.currencyRow}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[budgetStyles.curBtn, inputCurrency === c && budgetStyles.curBtnActive]}
                onPress={() => setInputCurrency(c)}
              >
                <Text style={[budgetStyles.curLabel, inputCurrency === c && budgetStyles.curLabelActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={budgetStyles.inputRow}>
            <Text style={budgetStyles.symbol}>{CURRENCY_SYMBOL[inputCurrency]}</Text>
            <TextInput
              style={budgetStyles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              autoFocus
            />
          </View>

          {inputCurrency !== 'NIS' && previewNIS !== null && (
            <View style={budgetStyles.preview}>
              <Text style={budgetStyles.previewText}>
                ≈ ₪{previewNIS.toFixed(2)} {t('willBeSavedInNis' as any)}
              </Text>
            </View>
          )}

          <View style={budgetStyles.btnRow}>
            <TouchableOpacity style={budgetStyles.cancelBtn} onPress={onClose}>
              <Text style={budgetStyles.cancelLabel}>{t('cancel' as any)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={budgetStyles.saveBtn} onPress={handleSave}>
              <Text style={budgetStyles.saveLabel}>{t('save' as any)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component: DailyTotalCard
// ─────────────────────────────────────────────────────────────

export default function DailyTotalCard() {
  const { t } = useI18n();
  const { rates, loading: ratesLoading, hasError: ratesError, toNIS, fromNIS, refresh } = useCurrencyRates();

  const [totalSpentNIS,  setTotalSpentNIS]  = useState(0);
  const [dailyBudgetNIS, setDailyBudgetNIS] = useState(250);
  const [dataLoading,    setDataLoading]    = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState<Currency>('NIS');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showRatesModal,  setShowRatesModal]  = useState(false);

  useEffect(() => {
    (async () => {
      const [budget, currency] = await Promise.all([
        AsyncStorage.getItem(STORAGE.budget),
        AsyncStorage.getItem(STORAGE.currency),
      ]);
      if (budget)   setDailyBudgetNIS(parseFloat(budget));
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
        const item     = child.val();
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
    try {
      await AsyncStorage.setItem(STORAGE.budget, amountNIS.toString());
      setDailyBudgetNIS(amountNIS);
    } catch {
      Alert.alert(t('error' as any), t('uploadFailed' as any));
    }
  };

  const cycleCurrency = async () => {
    const nextIndex = (CURRENCIES.indexOf(displayCurrency) + 1) % CURRENCIES.length;
    const next      = CURRENCIES[nextIndex];
    setDisplayCurrency(next);
    await AsyncStorage.setItem(STORAGE.currency, next);
  };

  const symbol        = CURRENCY_SYMBOL[displayCurrency];
  const displayTotal  = fromNIS(totalSpentNIS,  displayCurrency);
  const displayBudget = fromNIS(dailyBudgetNIS, displayCurrency);

  const budgetPercent = dailyBudgetNIS > 0
    ? Math.min(Math.round((totalSpentNIS / dailyBudgetNIS) * 100), 100)
    : 0;

  const isOverBudget = totalSpentNIS > dailyBudgetNIS && dailyBudgetNIS > 0;
  const isNearLimit  = budgetPercent >= 80 && !isOverBudget;

  const badgeColor = isOverBudget ? THEME.danger : isNearLimit ? THEME.warning : THEME.success;
  const badgeIcon  = isOverBudget ? '🚨' : isNearLimit ? '⚠️' : '✅';
  const isLoading = dataLoading || ratesLoading;
  const arrowBack = () => router.back();

  return (
    <View style={styles.container}>
       <Text style={styles.headerTitle}>{t("dailyPurchases")}</Text>
      <Ionicons
        name="arrow-back"
        size={24}
        color="#111"
        style={styles.backButton}
        onPress={arrowBack}
      />
      <LinearGradient
        colors={[THEME.primaryLight, THEME.primary, '#5C2ECC']}
        start={{ x: 1, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>{t('totalExpenses' as any)}</Text>
            <TouchableOpacity style={styles.ratesBtn} onPress={() => setShowRatesModal(true)}>
              {ratesLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.ratesBtnText}>{ratesError ? '⚠️' : '💱'} {t('rates' as any)}</Text>
              }
            </TouchableOpacity>
          </View>

          <Text style={styles.amount}>
            {isLoading ? '...' : `${symbol}${displayTotal.toFixed(2)}`}
          </Text>

          {budgetPercent > 0 && (
            <TouchableOpacity onPress={cycleCurrency}>
              <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                <Text style={styles.badgeText}>
                  {badgeIcon} {budgetPercent}% {t('ofDailyBudget' as any)}
                  {'   ·   '}{displayCurrency} →
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.editButton} onPress={() => setShowBudgetModal(true)}>
            <Text style={styles.editButtonText}>
              {t('editDailyBudget' as any)} ({symbol}{displayBudget.toFixed(0)})
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <BudgetModal visible={showBudgetModal} onClose={() => setShowBudgetModal(false)} onSave={saveBudget} rates={rates} />
      <RatesModal visible={showRatesModal} onClose={() => setShowRatesModal(false)} rates={rates} loading={ratesLoading} hasError={ratesError} onRefresh={refresh} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:        { marginHorizontal: 16, marginVertical: 12, borderRadius: 40, overflow: 'hidden', elevation: 8 , marginTop: 50},
  gradient:         { minHeight: 220, borderRadius: 40, position: 'relative' },
  content:          { flex: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 30, zIndex: 3, alignItems: 'flex-start' },
  circleTopRight:   { position: 'absolute', top: -60, right: -43, width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255,255,255,0.04)' },
  circleBottomLeft: { position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.04)' },
  headerRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 4 },
  label:            { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.9)', letterSpacing: 1.5, textTransform: 'uppercase' },
  ratesBtn:         { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  ratesBtnText:     { color: '#fff', fontSize: 12, fontWeight: '700' },
  amount:           { fontSize: 42, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
  badge:            { alignSelf: 'flex-start', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, marginBottom: 2 },
  badgeText:        { fontSize: 11, fontWeight: '700', color: '#fff' },
  editButton:       { marginTop: 14, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  editButtonText:   { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginLeft: 30,
    marginBottom: 20,
    textAlign: 'left',
    paddingHorizontal: 15,
    paddingVertical: 1,
  },
  backButton: {
    position: 'absolute',
    top: 5,
    left: 10,
    zIndex: 10,
  },
});

const ratesStyles = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle:      { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:       { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  sub:         { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
  grid:        { flexDirection: 'row', gap: 10, marginBottom: 20 },
  card:        { flex: 1, backgroundColor: '#f5f3ff', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4 },
  flag:        { fontSize: 24 },
  pair:        { fontSize: 13, fontWeight: '700', color: '#555' },
  value:       { fontSize: 14, fontWeight: '800', color: THEME.primary },
  errorBox:    { backgroundColor: '#fff3f3', borderRadius: 12, padding: 14, marginBottom: 16 },
  errorText:   { color: THEME.danger, textAlign: 'center', fontSize: 13 },
  refreshBtn:  { backgroundColor: '#f5f3ff', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  refreshText: { color: THEME.primary, fontWeight: '700' },
  closeBtn:    { backgroundColor: THEME.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  closeText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
});

const budgetStyles = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  card:           { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '88%' },
  title:          { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  sub:            { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 16 },
  currencyRow:    { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 16 },
  curBtn:         { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: '#f0f0f0' },
  curBtnActive:   { backgroundColor: THEME.primary },
  curLabel:       { fontWeight: '700', color: '#555', fontSize: 13 },
  curLabelActive: { color: '#fff' },
  inputRow:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 14, paddingHorizontal: 14, marginBottom: 10 },
  symbol:         { fontSize: 22, color: THEME.primary, marginRight: 8, fontWeight: '700' },
  input:          { flex: 1, fontSize: 28, fontWeight: '700', paddingVertical: 14, color: '#1c1c1e' },
  preview:        { backgroundColor: '#f5f3ff', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 12, alignItems: 'center' },
  previewText:    { color: THEME.primary, fontWeight: '600', fontSize: 13 },
  btnRow:         { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn:      { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center' },
  saveBtn:        { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: THEME.primary, alignItems: 'center' },
  cancelLabel:    { color: '#333', fontWeight: '700' },
  saveLabel:      { color: '#fff', fontWeight: '700' },
});