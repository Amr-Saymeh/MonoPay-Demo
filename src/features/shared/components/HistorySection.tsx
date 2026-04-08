import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { SharedLog, UserProfile } from "../types";
import { HistoryRow } from "./HistoryRow";

interface HistorySectionProps {
  logs: SharedLog[];
  loading: boolean;
  allUsers: Record<string, UserProfile>;
}

export function HistorySection({ logs, loading, allUsers }: HistorySectionProps) {
  const { t } = useI18n();

  return (
    <ThemedView style={styles.sectionCard}>
      <View style={styles.pillHeader}>
        <ThemedText style={styles.pillHeaderText}>{t("history") ?? "History"}</ThemedText>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : logs.length === 0 ? (
        <ThemedText style={styles.emptyText}>{t("noHistory") ?? "No activity yet."}</ThemedText>
      ) : (
        <View style={styles.leftBorder}>
          {logs.map((item, index) => {
            const actor = allUsers[item.userUid];
            const actorLabel = actor?.name?.trim() || actor?.email?.trim() || item.userUid || "—";
            return (
              <HistoryRow
                key={item.id}
                item={item}
                index={index}
                isLast={index === logs.length - 1}
                actorLabel={actorLabel}
              />
            );
          })}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
    backgroundColor: "rgba(17,24,28,0.03)",
  },
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
  leftBorder: {
    borderLeftWidth: 2.5,
    borderLeftColor: "#a78bfa",
    paddingLeft: 14,
  },
  center: { paddingVertical: 32, alignItems: "center" },
  emptyText: { opacity: 0.65 },
});
