import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CURRENCY_SYMBOLS } from "../types";
import { EnrichedWalletSlot } from "../hooks/useUserWallets";

interface Props {
  label: string;
  placeholder: string;
  selectedSlot: EnrichedWalletSlot | null;
  wallets: EnrichedWalletSlot[];
  loading: boolean;
  onSelect: (slot: EnrichedWalletSlot) => void;
  isRtl?: boolean;
}

function WalletBadge({ slot }: { slot: EnrichedWalletSlot }) {
  const currencies = Object.keys(slot.wallet?.currancies ?? {});
  const emoji = slot.emoji ?? (slot.wallet?.type === "credit" ? "💳" : "👛");

  return (
    <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 12 }}>
      <View style={{
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: slot.color ?? "#EDE9FE",
        alignItems: "center", justifyContent: "center",
      }}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#1F2937", fontWeight: "600", fontSize: 15 }}>
          {slot.slotName}
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
          {slot.wallet?.type === "credit" ? "Credit" : "Wallet"} ·{" "}
          {currencies.length > 0
            ? currencies
                .map((c) =>
                  `${CURRENCY_SYMBOLS[c] ?? c.toUpperCase()}${(slot.wallet!.currancies![c] ?? 0).toFixed(2)}`
                )
                .join(", ")
            : "No balance"}
        </Text>
      </View>
    </View>
  );
}

export function WalletPicker({
  label,
  placeholder,
  selectedSlot,
  wallets,
  loading,
  onSelect,
  isRtl = false,
}: Props) {
  const [visible, setVisible] = useState(false);

  const handleSelect = (slot: EnrichedWalletSlot) => {
    onSelect(slot);
    setVisible(false);
  };

  return (
    <>
      {/* ── Trigger ── */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingHorizontal: 16,
          height: 64,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#7C3AED" />
        ) : selectedSlot ? (
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <WalletBadge slot={selectedSlot} />
            <Text style={{ color: "#9CA3AF", marginLeft: 8 }}>▾</Text>
          </View>
        ) : (
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#9CA3AF", fontSize: 15 }}>{placeholder}</Text>
            <Text style={{ color: "#9CA3AF" }}>▾</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── Modal ── */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={{ backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2 }} />
            </View>

            <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1F2937", marginBottom: 16 }}>
                {label}
              </Text>

              {loading ? (
                <ActivityIndicator color="#7C3AED" style={{ paddingVertical: 32 }} />
              ) : wallets.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 40 }}>👛</Text>
                  <Text style={{ color: "#9CA3AF" }}>No active wallets</Text>
                </View>
              ) : (
                <FlatList
                  data={wallets}
                  keyExtractor={(item) => item.slotKey}
                  style={{ maxHeight: 320 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.7}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 12,
                        borderRadius: 16,
                        marginBottom: 8,
                        backgroundColor: selectedSlot?.slotKey === item.slotKey ? "#EDE9FE" : "#F9FAFB",
                        borderWidth: selectedSlot?.slotKey === item.slotKey ? 1 : 0,
                        borderColor: "#DDD6FE",
                      }}
                    >
                      <WalletBadge slot={item} />
                      {selectedSlot?.slotKey === item.slotKey && (
                        <Text style={{ color: "#7C3AED", fontWeight: "bold", marginLeft: 8 }}>✓</Text>
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}
              <View style={{ height: 24 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
