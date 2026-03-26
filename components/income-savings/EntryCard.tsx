// components/income-savings/EntryCard.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useI18n } from "@/hooks/use-i18n";
import React from "react";
import { StyleSheet, View, Text } from "react-native";

interface EntryCardProps {
  amount: number;
  currency: string;
  notes: string;
  date: number;
  type: "send" | "receive";
  category: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function EntryCard({
  amount,
  currency,
  notes,
  date,
  type,
  category,
  onEdit,
  onDelete,
}: EntryCardProps) {
  const { t } = useI18n();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  };

  const getCategoryLabel = (category: string) => {
    const key = `incomeSavings.categories.${category}`;
    return t(key as any) || category;
  };

  const getTypeLabel = (type: string) => {
    const key = `incomeSavings.entryTypes.${type}`;
    return t(key as any) || type;
  };

  return (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <ThemedText style={styles.typeText}>{getTypeLabel(type)}</ThemedText>
        </View>
        <ThemedText style={styles.category}>
          {getCategoryLabel(category)}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.amount}>
          {formatCurrency(amount, currency)}
        </ThemedText>
        <ThemedText style={styles.date}>{formatDate(date)}</ThemedText>
      </View>

      {notes ? <ThemedText style={styles.notes}>{notes}</ThemedText> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: "#EDE9FE",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7C3AED",
  },
  category: {
    fontSize: 14,
    color: "#6B7280",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
  },
  notes: {
    fontSize: 14,
    color: "#374151",
    fontStyle: "italic",
  },
});
