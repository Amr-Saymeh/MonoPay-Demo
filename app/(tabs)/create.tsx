// app/(tabs)/goals/create.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GradientButton } from "@/components/ui/gradient-button";
import { useAuthSession } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { app } from "@/src/firebaseConfig";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getDatabase, ref, update, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateGoalScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthSession();

  const isEditing = params.edit === "true";

  const [title, setTitle] = useState(params.goal?.toString() || "");
  const [targetAmount, setTargetAmount] = useState(
    params.goalTargetAmount?.toString() || "",
  );
  const [currentAmount, setCurrentAmount] = useState(
    params.currentAmount?.toString() || "",
  );
  const [targetDate, setTargetDate] = useState(
    params.goalTargetDate?.toString() || "",
  );
  const [displayDate, setDisplayDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currency, setCurrency] = useState(
    params.goalTargetCurrency?.toString() || "usd",
  );

  const currencies = ["usd", "eur", "nis"];

  useEffect(() => {
    if (isEditing) {
      setTitle(params.goal?.toString() || "");
      setTargetAmount(params.goalTargetAmount?.toString() || "");
      setCurrentAmount(params.currentAmount?.toString() || "");
      setTargetDate(params.goalTargetDate?.toString() || "");
      if (params.goalTargetDate) {
        const date = new Date(parseInt(params.goalTargetDate?.toString() || "0"));
        setDisplayDate(date.toLocaleDateString());
      }
      setCurrency(params.goalTargetCurrency?.toString() || "usd");
    }
  }, [params, isEditing]);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const db = getDatabase(app);

      if (isEditing) {
        // Update existing goal
        const goalRef = ref(db, `wallets/${params.id}`);
        await update(goalRef, {
          goal: title,
          goalTargetAmount: parseFloat(targetAmount),
          goalTargetCurrency: currency.toLowerCase(),
          goalTargetDate: parseInt(targetDate) || Date.now(),
          currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        });
        console.log(t("goals.updateSuccess"));
      } else {
        // Create new goal
        const newGoalData = {
          type: "shared",
          ownerUid: user.uid,
          goal: title,
          goalTargetAmount: parseFloat(targetAmount),
          goalTargetCurrency: currency.toLowerCase(),
          goalTargetDate: parseInt(targetDate) || Date.now(),
          currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
          members: { [user.uid]: true },
          createdAt: Date.now(),
        };
        const newGoalRef = ref(db, `wallets/${Date.now()}`);
        await set(newGoalRef, newGoalData);
        console.log(t("goals.createSuccess"));
      }

      // Reset form fields after successful submission
      if (!isEditing) {
        setTitle("");
        setTargetAmount("");
        setCurrentAmount("");
        setTargetDate("");
        setDisplayDate("");
        setCurrency("usd");
      }

      router.back();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount) || 0;
    return `${num.toFixed(2)} ${currency.toUpperCase()}`;
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    if (event.type === "set" && selectedDate) {
      setTargetDate(selectedDate.getTime().toString());
      setDisplayDate(selectedDate.toLocaleDateString());
    }
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <ThemedText style={styles.title}>
          {isEditing ? t("goals.editTitle") : t("goals.createTitle")}
        </ThemedText>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      <ScrollView style={styles.content}>
        {/* Live Preview Card */}
        <ThemedView style={styles.previewCard}>
          <ThemedText style={styles.previewTitle}>
            {title || t("goals.goalName")}
          </ThemedText>
          <ThemedText style={styles.previewAmount}>
            {formatCurrency(targetAmount, currency)}
          </ThemedText>
          {targetDate ? (
            <ThemedText style={styles.previewDate}>
              {formatDate(parseInt(targetDate))}
            </ThemedText>
          ) : null}
        </ThemedView>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              {t("goals.goalName")} *
            </ThemedText>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={t("goals.goalName")}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              {t("goals.targetAmount")} *
            </ThemedText>
            <TextInput
              style={styles.input}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              {t("goals.currentAmount")} 
            </ThemedText>
            <TextInput
              style={styles.input}
              value={currentAmount}
              onChangeText={setCurrentAmount}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              {t("goals.targetDate")} *
            </ThemedText>
            <Pressable onPress={openDatePicker} style={styles.input}>
              <Text style={{ fontSize: 16, color: displayDate ? "#000" : "#aaa" }}>
                {displayDate || t("goals.targetDate")}
              </Text>
            </Pressable>
            
            {showDatePicker && (
              <DateTimePicker
                value={targetDate ? new Date(parseInt(targetDate)) : new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>{t("goals.currency")}</ThemedText>
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
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label={isEditing ? t("common.save") : t("common.add")}
          onPress={handleSubmit}
          disabled={!title || !targetAmount}
        />
      </View>
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
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  previewCard: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  previewAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  previewDate: {
    fontSize: 14,
    color: "#EDE9FE",
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    justifyContent: "center",
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
  footer: {
    padding: 16,
  },
});
