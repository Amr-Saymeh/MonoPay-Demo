// components/goals/ContributionModal.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GradientButton } from "@/components/ui/gradient-button";
import { useI18n } from "@/hooks/use-i18n";
import React, { useState } from "react";
import { StyleSheet, TextInput, View, Text } from "react-native";

interface ContributionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason?: string) => void;
  currency: string;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  visible,
  onClose,
  onSubmit,
  currency,
}) => {
  const { t } = useI18n();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    if (!isNaN(amountNum) && amountNum > 0) {
      onSubmit(amountNum, reason);
      setAmount("");
      setReason("");
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <ThemedView style={styles.overlay}>
      <ThemedView style={styles.modal}>
        <ThemedText style={styles.title}>
          {t("goals.addContribution")}
        </ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>
            {t("goals.contributionAmount")}
          </ThemedText>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder={`0.00 ${currency.toUpperCase()}`}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>
            {t("goals.contributionReason")}
          </ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={reason}
            onChangeText={setReason}
            placeholder={t("goals.contributionReason")}
            multiline
          />
        </View>

        <View style={styles.buttons}>
          <GradientButton
            label={t("common.cancel")}
            onPress={onClose}
            style={styles.button}
          />
          <GradientButton
            label={t("common.save")}
            onPress={handleSubmit}
            style={styles.button}
          />
        </View>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
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
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
