// app/(tabs)/income-savings.tsx
import { AddEntryModal } from "@/components/income-savings/AddEntryModal";
import { EntryCard } from "@/components/income-savings/EntryCard";
import { SummaryCard } from "@/components/income-savings/SummaryCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthSession } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { app } from "@/src/firebaseConfig";
import { MaterialIcons } from "@expo/vector-icons";
import {
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IncomeSavingsScreen() {
  const { t } = useI18n();
  const { user } = useAuthSession();
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    income: { usd: 0, eur: 0, nis: 0 },
    outgoing: { usd: 0, eur: 0, nis: 0 },
  });
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const db = getDatabase(app);
    const entriesRef = ref(db, `users/${user.uid}/transaction history`);

    const unsubscribe = onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setEntries([]);
        setSummary({
          income: { usd: 0, eur: 0, nis: 0 },
          outgoing: { usd: 0, eur: 0, nis: 0 },
        });
        return;
      }

      const entriesList = Object.entries(data).map(
        ([key, entry]: [string, any]) => ({
          id: key,
          ...entry,
        }),
      );

      setEntries(entriesList);

      // Calculate summary
      const incomeTotals = { usd: 0, eur: 0, nis: 0 };
      const outgoingTotals = { usd: 0, eur: 0, nis: 0 };

      entriesList.forEach((entry) => {
        const currency = (entry.currency?.toLowerCase() || "usd") as
          | "usd"
          | "eur"
          | "nis";
        const amount = entry.amount || 0;

        if (entry.type === "receive") {
          incomeTotals[currency] = (incomeTotals[currency] || 0) + amount;
        } else {
          outgoingTotals[currency] = (outgoingTotals[currency] || 0) + amount;
        }
      });

      setSummary({
        income: incomeTotals,
        outgoing: outgoingTotals,
      });
    });

    return () => unsubscribe();
  }, [user]);

  const sortedEntries = [...entries].sort((a, b) => {
    if (sortBy === "amount") {
      return b.amount - a.amount;
    }
    return (b["transaction date"] || 0) - (a["transaction date"] || 0);
  });

  const handleAddEntry = () => {
    setEditingEntry(null);
    setShowModal(true);
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setShowModal(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;

    try {
      const db = getDatabase(app);
      await remove(ref(db, `users/${user.uid}/transaction history/${entryId}`));
      console.log(t("incomeSavings.deleteSuccess"));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleSubmitEntry = async (data: any) => {
    if (!user) return;

    try {
      const db = getDatabase(app);

      if (editingEntry) {
        // Update existing entry
        const entryRef = ref(
          db,
          `users/${user.uid}/transaction history/${editingEntry.id}`,
        );
        await update(entryRef, {
          ...data,
          "transaction date": Date.now(),
          senderUid: data.type === "send" ? user.uid : "",
          receiverUid: data.type === "receive" ? user.uid : "",
        });
        console.log(t("incomeSavings.updateSuccess"));
      } else {
        // Create new entry
        const entriesRef = ref(db, `users/${user.uid}/transaction history`);
        const newEntryRef = push(entriesRef);
        await set(newEntryRef, {
          ...data,
          "transaction date": Date.now(),
          senderUid: data.type === "send" ? user.uid : "",
          receiverUid: data.type === "receive" ? user.uid : "",
        });
        console.log(t("incomeSavings.createSuccess"));
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t("incomeSavings.title")}</ThemedText>
          <Pressable style={styles.addButton} onPress={handleAddEntry}>
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <SummaryCard
              title={t("incomeSavings.totalIncome")}
              amount={
                summary.income.usd + summary.income.eur + summary.income.nis
              }
              currency="USD"
              type="income"
            />
            <SummaryCard
              title={t("incomeSavings.totalOutgoing")}
              amount={
                summary.outgoing.usd + summary.outgoing.eur + summary.outgoing.nis
              }
              currency="USD"
              type="outgoing"
            />
          </View>

          {/* Sort Toggle */}
          <View style={styles.sortContainer}>
            <ThemedText style={styles.sortLabel}>
              {t("incomeSavings.sortBy")}:
            </ThemedText>
            <View style={styles.sortButtons}>
              <Pressable
                style={[
                  styles.sortButton,
                  sortBy === "date" && styles.activeSortButton,
                ]}
                onPress={() => setSortBy("date")}
              >
                <ThemedText
                  style={[
                    styles.sortButtonText,
                    sortBy === "date" && styles.activeSortButtonText,
                  ]}
                >
                  {t("incomeSavings.sortByDate")}
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.sortButton,
                  sortBy === "amount" && styles.activeSortButton,
                ]}
                onPress={() => setSortBy("amount")}
              >
                <ThemedText
                  style={[
                    styles.sortButtonText,
                    sortBy === "amount" && styles.activeSortButtonText,
                  ]}
                >
                  {t("incomeSavings.sortByAmount")}
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Entries List */}
          {sortedEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              amount={entry.amount}
              currency={entry.currency}
              notes={entry.notes}
              date={entry["transaction date"]}
              type={entry.type}
              category={entry.category}
              onEdit={() => handleEditEntry(entry)}
              onDelete={() => handleDeleteEntry(entry.id)}
            />
          ))}
        </ScrollView>

        <AddEntryModal
          visible={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingEntry(null);
          }}
          onSubmit={handleSubmitEntry}
          initialData={editingEntry}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#10B981",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
  },
  sortButtons: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 4,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeSortButton: {
    backgroundColor: "#7C3AED",
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeSortButtonText: {
    color: "#FFFFFF",
  },
});
