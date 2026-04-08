import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  InputAccessoryView,
  Keyboard,
  StyleSheet,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ThemedText } from "@/components/themed-text";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";

interface AmountModalProps {
  visible: boolean;
  onClose: () => void;
  isAdd: boolean;
  amount: string;
  onAmountChange: (value: string) => void;
  amountCurrency: string | null;
  onCurrencyChange: (currency: string) => void;
  amountReason: string;
  onReasonChange: (value: string) => void;
  availableCurrencies: string[];
  saving: boolean;
  onConfirm: () => void;
  availableBalance?: number;
}

function formatCurrency(code: string) {
  return code.trim().toUpperCase();
}

function formatAmount(value: number) {
  return Number(value).toFixed(2);
}

export function AmountModal({
  visible,
  onClose,
  isAdd,
  amount,
  onAmountChange,
  amountCurrency,
  onCurrencyChange,
  amountReason,
  onReasonChange,
  availableCurrencies,
  saving,
  onConfirm,
  availableBalance,
}: AmountModalProps) {
  const { t } = useI18n();

  const showBalanceInfo = !isAdd && amountCurrency && availableBalance !== undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHandle} />

          <ThemedText type="subtitle" style={styles.modalTitle}>
            {isAdd ? t("add money") ?? "Add money" : t("spendMoney") ?? "Spend money"}
          </ThemedText>

          {/* Balance info for remove */}
          {showBalanceInfo && (
            <View style={styles.balanceInfoContainer}>
              <ThemedText style={styles.balanceInfoLabel}>
                {t("availableBalance") ?? "Available"}
              </ThemedText>
              <ThemedText style={styles.balanceInfoValue}>
                {formatAmount(availableBalance)} {formatCurrency(amountCurrency)}
              </ThemedText>
            </View>
          )}

          <ThemedText style={styles.sectionTitle}>{t("amount") ?? "Amount"}</ThemedText>
          <AuthInput
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="numeric"
            placeholder="0.00"
            inputAccessoryViewID="amount_input_accessory"
          />

          <ThemedText style={[styles.sectionTitle, { marginTop: 6 }]}>
            {t("currency") ?? "Currency"}
          </ThemedText>
          <View style={styles.currencyChipsRow}>
            {availableCurrencies.map((code) => {
              const isSelected = formatCurrency(amountCurrency ?? "") === formatCurrency(code);
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={code}
                  onPress={() => onCurrencyChange(code)}
                  style={[
                    styles.currencyChip,
                    isSelected && styles.currencyChipSelected,
                  ]}
                >
                  <ThemedText
                    style={[styles.currencyChipText, isSelected && styles.currencyChipTextSelected]}
                  >
                    {formatCurrency(code)}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <ThemedText style={[styles.sectionTitle, { marginTop: 6 }]}>
            {t("noteOptional") ?? "Note (optional)"}
          </ThemedText>
          <TextInput
            value={amountReason}
            onChangeText={onReasonChange}
            placeholder={t("reasonPlaceholder") ?? "Why?"}
            style={styles.noteInput}
            multiline
            inputAccessoryViewID="note_input_accessory"
          />

          <GradientButton
            label={saving ? t("saving") ?? "Saving..." : t("confirm") ?? "Confirm"}
            onPress={onConfirm}
            disabled={saving}
            loading={saving}
            style={styles.modalPrimaryButton}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            disabled={saving}
            style={[styles.modalSecondaryButton, saving && styles.disabledButton]}
          >
            <ThemedText style={styles.modalSecondaryText}>{t("cancel") ?? "Cancel"}</ThemedText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>

      {Platform.OS === "ios" && (
        <>
          <InputAccessoryView nativeID="amount_input_accessory">
            <View style={styles.inputAccessory}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => Keyboard.dismiss()}>
                <MaterialIcons name="check-circle" size={28} color="#a855f7" />
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
          <InputAccessoryView nativeID="note_input_accessory">
            <View style={styles.inputAccessory}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => Keyboard.dismiss()}>
                <MaterialIcons name="check-circle" size={28} color="#a855f7" />
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
        </>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 10,
  },
  modalHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  modalTitle: { marginBottom: 8 },
  balanceInfoContainer: {
    backgroundColor: "rgba(124,58,237,0.08)",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceInfoLabel: { fontSize: 13, opacity: 0.7 },
  balanceInfoValue: { fontSize: 14, fontFamily: Fonts.sansBold, color: "#7c3aed" },
  sectionTitle: { opacity: 0.65, fontFamily: Fonts.sansBold },
  currencyChipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  currencyChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.12)",
    backgroundColor: "#F8FAFC",
  },
  currencyChipSelected: { borderColor: "#7c3aed", backgroundColor: "rgba(124,58,237,0.09)" },
  currencyChipText: { fontSize: 13, color: "#111827" },
  currencyChipTextSelected: { color: "#7c3aed" },
  noteInput: {
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.10)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  modalPrimaryButton: { marginTop: 16 },
  modalSecondaryButton: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.10)",
    marginTop: 10,
    backgroundColor: "#fff",
  },
  modalSecondaryText: { color: "rgba(17,24,28,0.75)", fontFamily: Fonts.sansBold },
  disabledButton: { opacity: 0.5 },
  inputAccessory: {
    backgroundColor: "#F8FAFC",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(17,24,28,0.08)",
  },
});
