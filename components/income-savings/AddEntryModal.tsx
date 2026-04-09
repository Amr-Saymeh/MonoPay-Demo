// components/income-savings/AddEntryModal.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, ScrollView } from "react-native";

interface AddEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: "send" | "receive";
    category: string;
    amount: number;
    currency: string;
    regularity: string;
    notes: string;
  }) => void;
  initialData?: {
    type?: "send" | "receive";
    category?: string;
    amount?: number;
    currency?: string;
    regularity?: string;
    notes?: string;
  };
}

export function AddEntryModal({
  visible,
  onClose,
  onSubmit,
  initialData,
}: AddEntryModalProps) {
  const { t } = useI18n();
  const backgroundColor = useThemeColor({}, "inputBackground");
  const borderColor = useThemeColor({}, "inputBorder");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholder");
  
  const [type, setType] = useState<"send" | "receive">(
    initialData?.type || "receive",
  );
  const [category, setCategory] = useState(initialData?.category || "salary");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [currency, setCurrency] = useState(initialData?.currency || "usd");
  const [regularity, setRegularity] = useState(
    initialData?.regularity || "monthly",
  );
  const [notes, setNotes] = useState(initialData?.notes || "");

  const incomeCategories = ["salary", "freelance", "loan", "other"];
  const savingsCategories = ["savings", "debt", "other"];
  const currencies = ["usd", "eur", "nis"];
  const regularities = ["daily", "weekly", "monthly", "yearly"];

  const getCategoryLabel = (cat: string) => {
    const key = `incomeSavings.categories.${cat}`;
    return t(key as any) || cat;
  };

  const getRegularityLabel = (reg: string) => {
    const key = `incomeSavings.${reg}`;
    return t(key as any) || reg;
  };

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    if (!isNaN(amountNum) && amountNum > 0) {
      onSubmit({
        type,
        category,
        amount: amountNum,
        currency,
        regularity,
        notes,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset form if it's a new entry (no initial data)
    if (!initialData) {
      setType("receive");
      setCategory("salary");
      setAmount("");
      setCurrency("usd");
      setRegularity("monthly");
      setNotes("");
    }
    onClose();
  };

  const categories = type === "receive" ? incomeCategories : savingsCategories;

  if (!visible) return null;

  return (
    <ThemedView style={styles.overlay}>
      <ThemedView style={styles.modal}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {initialData
              ? t("incomeSavings.editEntry")
              : t("incomeSavings.addEntry")}
          </ThemedText>
          <Pressable onPress={handleClose}>
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        <View style={styles.toggleContainer}>
          <Pressable
            style={[
              styles.toggleButton,
              type === "receive" && styles.activeToggle,
            ]}
            onPress={() => {
              setType("receive");
              setCategory("salary");
            }}
          >
            <ThemedText
              style={[
                styles.toggleText,
                type === "receive" && styles.activeToggleText,
              ]}
            >
              {t("incomeSavings.income")}
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.toggleButton,
              type === "send" && styles.activeToggle,
            ]}
            onPress={() => {
              setType("send");
              setCategory("savings");
            }}
          >
            <ThemedText
              style={[
                styles.toggleText,
                type === "send" && styles.activeToggleText,
              ]}
            >
              {t("incomeSavings.savings")}
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView 
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                {t("incomeSavings.source")}
              </ThemedText>
              <View style={styles.pillContainer}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[styles.pill, category === cat && styles.selectedPill]}
                    onPress={() => setCategory(cat)}
                  >
                    <ThemedText
                      style={[
                        styles.pillText,
                        category === cat && styles.selectedPillText,
                      ]}
                    >
                      {getCategoryLabel(cat)}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                {t("incomeSavings.amount")}
              </ThemedText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor, borderColor, color: textColor }
              ]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={placeholderColor}
              keyboardType="numeric"
            />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flexOne]}>
                <ThemedText style={styles.label}>
                  {t("incomeSavings.currency" as any)}
                </ThemedText>
                <View style={styles.pillContainer}>
                  {currencies.map((curr) => (
                    <Pressable
                      key={curr}
                      style={[
                        styles.pill,
                        currency === curr && styles.selectedPill,
                      ]}
                      onPress={() => setCurrency(curr)}
                    >
                      <ThemedText
                        style={[
                          styles.pillText,
                          currency === curr && styles.selectedPillText,
                        ]}
                      >
                        {curr.toUpperCase()}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={[styles.inputGroup, styles.flexOne]}>
                <ThemedText style={styles.label}>
                  {t("incomeSavings.regularity" as any)}
                </ThemedText>
                <View style={styles.pillContainer}>
                  {regularities.map((reg) => (
                    <Pressable
                      key={reg}
                      style={[
                        styles.pill,
                        regularity === reg && styles.selectedPill,
                      ]}
                      onPress={() => setRegularity(reg)}
                    >
                      <ThemedText
                        style={[
                          styles.pillText,
                          regularity === reg && styles.selectedPillText,
                        ]}
                      >
                        {getRegularityLabel(reg)}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                {t("incomeSavings.notes")}
              </ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor, borderColor, color: textColor }
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t("incomeSavings.notes")}
              placeholderTextColor={placeholderColor}
              multiline
            />
            </View>
          </View>
        </ScrollView>

        <GradientButton
          label={initialData ? t("common.save") : t("common.add")}
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: "#7C3AED",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeToggleText: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedPill: {
    backgroundColor: "#7C3AED",
  },
  pillText: {
    fontSize: 14,
    color: "#374151",
  },
  selectedPillText: {
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  flexOne: {
    flex: 1,
  },
  submitButton: {
    marginTop: 10,
  },
});
