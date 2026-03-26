// components/income-savings/SummaryCard.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';

interface SummaryCardProps {
  title: string;
  amount: number;
  currency: string;
  type: 'income' | 'outgoing';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  currency,
  type,
}) => {
  const { t } = useI18n();
  
  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  };

  return (
    <ThemedView style={[
      styles.card,
      type === 'income' ? styles.incomeCard : styles.outgoingCard
    ]}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.amount}>
        {formatCurrency(amount, currency)}
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  incomeCard: {
    backgroundColor: '#10B981',
  },
  outgoingCard: {
    backgroundColor: '#F87171',
  },
  title: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
