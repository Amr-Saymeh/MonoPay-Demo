import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';

// Hooks
import { useDailyTotal } from './hooks/useDailyTotal';
import { usePurchasesForm } from './hooks/usePurchasesForm';
import { usePurchasesList } from './hooks/usePurchasesList';

// Components
import DailyTotalCard, { RatesModal, BudgetModal } from './components/DailyTotalCard';
import PurchaseForm from './components/PurchaseForm';
import PurchaseList from './components/PurchaseList';

export default function PurchasesFeature() {
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const {
    totalSpentNIS,
    dailyBudgetNIS,
    displayCurrency,
    dataLoading,
    ratesLoading,
    ratesError,
    rates,
    symbol,
    fromNIS,
    refreshRates,
    saveBudget,
    cycleCurrency,
  } = useDailyTotal();

  const {
    control,
    errors,
    setValue,
    selectedCurrency,
    loading: formLoading,
    visibleToast,
    suggestions,
    onSubmit,
  } = usePurchasesForm();

  const {
    purchases,
    loading: listLoading,
    handleDelete,
  } = usePurchasesList();

  const displayTotal = fromNIS(totalSpentNIS, displayCurrency);
  const displayBudget = fromNIS(dailyBudgetNIS, displayCurrency);
  const budgetPercent = dailyBudgetNIS > 0
    ? Math.min(Math.round((totalSpentNIS / dailyBudgetNIS) * 100), 100)
    : 0;
  const isGlobalLoading = dataLoading || ratesLoading;

  return (
    <ScrollView style={styles.container}>
      <DailyTotalCard
        totalSpentNIS={totalSpentNIS}
        dailyBudgetNIS={dailyBudgetNIS}
        displayCurrency={displayCurrency}
        ratesLoading={ratesLoading}
        ratesError={ratesError}
        isLoading={isGlobalLoading}
        symbol={symbol}
        displayTotal={displayTotal}
        displayBudget={displayBudget}
        budgetPercent={budgetPercent}
        onRefreshRates={refreshRates}
        onEditBudget={() => setShowBudgetModal(true)}
        onCycleCurrency={cycleCurrency}
        onBack={() => {
          if (router.canGoBack()) {
             router.back()
          }
        }}
        onShowRatesModal={() => setShowRatesModal(true)}
      />

      <PurchaseForm
        onSubmit={onSubmit}
        loading={formLoading}
        visibleToast={visibleToast}
        suggestions={suggestions}
        control={control}
        errors={errors}
        setValue={setValue}
        selectedCurrency={selectedCurrency}
      />

      <PurchaseList
        purchases={purchases}
        loading={listLoading}
        onDelete={handleDelete}
      />

      <BudgetModal
        visible={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSave={saveBudget}
        rates={rates}
      />

      <RatesModal
        visible={showRatesModal}
        onClose={() => setShowRatesModal(false)}
        rates={rates}
        loading={ratesLoading}
        hasError={ratesError}
        onRefresh={refreshRates}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
