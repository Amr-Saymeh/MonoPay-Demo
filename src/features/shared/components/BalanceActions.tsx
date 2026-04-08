import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";

interface BalanceActionsProps {
  onAddMoney: () => void;
  onRemoveMoney: () => void;
}

export function BalanceActions({ onAddMoney, onRemoveMoney }: BalanceActionsProps) {
  const { t } = useI18n();

  return (
    <>
      <View style={styles.pillHeader}>
        <ThemedText style={styles.pillHeaderText}>{t("balance") ?? "Money"}</ThemedText>
      </View>

      <View style={styles.actionBtns}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.btn, styles.btnAdd]}
          onPress={onAddMoney}
        >
          <ThemedText style={styles.btnText}>+ {"add money"}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.btn, styles.btnRemove]}
          onPress={onRemoveMoney}
        >
          <ThemedText style={styles.btnText}>− {"remove money"}</ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pillHeader: {
    backgroundColor: "#3d3a52",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pillHeaderText: { color: "#f0eff5", fontSize: 13, fontFamily: Fonts.sansBold, letterSpacing: 0.3 },
  actionBtns: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  btnAdd: { backgroundColor: "#a855f7", shadowColor: "#a855f7" },
  btnRemove: { backgroundColor: "#c084fc", shadowColor: "#c084fc" },
  btnText: { color: "#fff", fontSize: 13, fontFamily: Fonts.sansBold, letterSpacing: 0.3 },
});
