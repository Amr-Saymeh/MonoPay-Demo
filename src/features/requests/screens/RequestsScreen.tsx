import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useI18n } from "@/hooks/use-i18n";
import { WalletPicker } from "@/src/features/transfer/components/WalletPicker";
import { useUserWallets } from "@/src/features/transfer/hooks/useUserWallets";
import {
  approveRequest,
  rejectRequest,
} from "@/src/features/transfer/services/transferService";
import { update, ref } from "firebase/database";
import { db } from "@/src/firebaseConfig";

import { RequestCard } from "../components/RequestCard";
import { MoneyRequestItem, useMoneyRequests } from "../hooks/useMoneyRequests";

// ─── TODO: replace with Firebase Auth ────────────────────────────────────────
const CURRENT_USER_UID = "E8tBkcVIY4TEdk9jzSQFLn3zTF72";

const STRINGS = {
  en: {
    title: "Requests",
    received: "Received 🔔",
    sent: "Sent 📤",
    emptyReceived: "No requests received",
    emptySent: "No requests sent",
    emptySubReceived:
      "When someone requests money from you, it'll show up here.",
    emptySubSent: "Your sent requests will appear here.",
    approveTitle: "Approve Request",
    approveMsg: (name: string, amount: string) =>
      `Approve payment of ${amount} to ${name}?`,
    selectWallet: "Select wallet to pay from",
    confirm: "Confirm",
    cancel: "Cancel",
    rejectTitle: "Reject Request",
    rejectMsg: (name: string) => `Reject payment request from ${name}?`,
    cancelTitle: "Cancel Request",
    cancelMsg: "Cancel this money request?",
    success: "Done! ✅",
    error: "Something went wrong. Please try again.",
  },
  ar: {
    title: "الطلبات",
    received: "واردة 🔔",
    sent: "صادرة 📤",
    emptyReceived: "لا توجد طلبات واردة",
    emptySent: "لا توجد طلبات صادرة",
    emptySubReceived: "عندما يطلب منك أحد مالاً ستظهر هنا.",
    emptySubSent: "طلباتك المرسلة ستظهر هنا.",
    approveTitle: "تأكيد الموافقة",
    approveMsg: (name: string, amount: string) =>
      `الموافقة على دفع ${amount} لـ ${name}؟`,
    selectWallet: "اختر المحفظة للدفع منها",
    confirm: "تأكيد",
    cancel: "إلغاء",
    rejectTitle: "رفض الطلب",
    rejectMsg: (name: string) => `رفض طلب المال من ${name}؟`,
    cancelTitle: "إلغاء الطلب",
    cancelMsg: "إلغاء هذا الطلب؟",
    success: "تمّ! ✅",
    error: "حدث خطأ. حاول مرة أخرى.",
  },
};

export default function RequestsScreen() {
  const router = useRouter();
  const { language, isRtl } = useI18n();
  const s = STRINGS[language as "en" | "ar"] ?? STRINGS.en;

  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [actionLoading, setActionLoading] = useState(false);

  // Approve bottom sheet state
  const [approveItem, setApproveItem] = useState<MoneyRequestItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const { received, sent, loading } = useMoneyRequests(CURRENT_USER_UID);
  const { wallets: myWallets, loading: walletsLoading } =
    useUserWallets(CURRENT_USER_UID);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchTab = (tab: "received" | "sent") => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveTab(tab);
  };

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = (item: MoneyRequestItem) => {
    setApproveItem(item);
    setSelectedSlot(myWallets.find((w) => w.slotKey === "wallet1") ?? null);
  };

  const confirmApprove = async () => {
    if (!approveItem || !selectedSlot) return;
    setActionLoading(true);
    const result = await approveRequest({
      requestId: approveItem.id,
      payerUid: CURRENT_USER_UID,
      payerWalletSlotKey: selectedSlot.slotKey,
      requesterUid: approveItem.fromUserId,
      amount: approveItem.amount,
      currency: approveItem.currancy as any,
      category: approveItem.category,
      note: approveItem.note,
    });
    setActionLoading(false);
    setApproveItem(null);
    setSelectedSlot(null);
    if (result.success) {
      Alert.alert("", s.success);
    } else {
      Alert.alert("", s.error);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = (item: MoneyRequestItem) => {
    Alert.alert(s.rejectTitle, s.rejectMsg(item.otherPartyName ?? ""), [
      { text: s.cancel, style: "cancel" },
      {
        text: s.rejectTitle,
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          const result = await rejectRequest(
            CURRENT_USER_UID,
            item.fromUserId,
            item.id,
          );
          setActionLoading(false);
          if (result.success) Alert.alert("", s.success);
          else Alert.alert("", s.error);
        },
      },
    ]);
  };

  // ── Cancel (sent) ─────────────────────────────────────────────────────────
  const handleCancel = (item: MoneyRequestItem) => {
    Alert.alert(s.cancelTitle, s.cancelMsg, [
      { text: s.cancel, style: "cancel" },
      {
        text: s.cancelTitle,
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          try {
            const now = Date.now();
            await update(ref(db), {
              [`users/${CURRENT_USER_UID}/moneyRequests/${item.id}/status`]:
                "cancelled",
              [`users/${CURRENT_USER_UID}/moneyRequests/${item.id}/decidedAt`]:
                now,
              [`users/${item.toUserId}/moneyRequests/${item.id}/status`]:
                "cancelled",
              [`users/${item.toUserId}/moneyRequests/${item.id}/decidedAt`]:
                now,
            });
            Alert.alert("", s.success);
          } catch {
            Alert.alert("", s.error);
          }
          setActionLoading(false);
        },
      },
    ]);
  };

  const data = activeTab === "received" ? received : sent;
  const isEmpty = !loading && data.length === 0;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#7C3AED" }}>
        {/* ── Header ── */}
        <View
          style={{
            paddingTop: 56,
            paddingBottom: 20,
            paddingHorizontal: 24,
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 24 }}>
              {isRtl ? "→" : "←"}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>
            {s.title}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* ── Tab Bar ── */}
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            marginHorizontal: 24,
            marginBottom: 20,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: 4,
          }}
        >
          {(["received", "sent"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => switchTab(tab)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 13,
                backgroundColor: activeTab === tab ? "white" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 14,
                  color:
                    activeTab === tab ? "#7C3AED" : "rgba(255,255,255,0.75)",
                }}
              >
                {tab === "received" ? s.received : s.sent}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Content ── */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#F5F3FF",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
          }}
        >
          {loading ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#9CA3AF", fontSize: 16 }}>Loading...</Text>
            </View>
          ) : isEmpty ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: 40,
              }}
            >
              <Text style={{ fontSize: 56, marginBottom: 16 }}>
                {activeTab === "received" ? "🔔" : "📤"}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1F2937",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                {activeTab === "received" ? s.emptyReceived : s.emptySent}
              </Text>
              <Text
                style={{
                  color: "#9CA3AF",
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                {activeTab === "received" ? s.emptySubReceived : s.emptySubSent}
              </Text>
            </View>
          ) : (
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
              <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <RequestCard
                    item={item}
                    mode={activeTab}
                    language={language as "en" | "ar"}
                    isRtl={isRtl}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onCancel={handleCancel}
                  />
                )}
              />
            </Animated.View>
          )}
        </View>

        {/* ── Approve Bottom Sheet ── */}
        {approveItem && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "white",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            {/* Handle */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 2,
                }}
              />
            </View>

            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 6,
              }}
            >
              {s.approveTitle}
            </Text>
            <Text style={{ color: "#6B7280", marginBottom: 20 }}>
              {s.approveMsg(
                approveItem.otherPartyName ?? "",
                `${CURRENCY_SYMBOLS[approveItem.currancy] ?? ""}${approveItem.amount.toFixed(2)}`,
              )}
            </Text>

            <Text
              style={{ color: "#7C3AED", fontWeight: "600", marginBottom: 8 }}
            >
              {s.selectWallet}
            </Text>
            <WalletPicker
              label={s.selectWallet}
              placeholder={s.selectWallet}
              selectedSlot={selectedSlot}
              wallets={myWallets}
              loading={walletsLoading}
              onSelect={setSelectedSlot}
              isRtl={isRtl}
            />

            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  setApproveItem(null);
                  setSelectedSlot(null);
                }}
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: "#F3F4F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#6B7280", fontWeight: "600" }}>
                  {s.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmApprove}
                disabled={actionLoading || !selectedSlot}
                style={{
                  flex: 2,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: "#7C3AED",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: actionLoading || !selectedSlot ? 0.6 : 1,
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  {actionLoading ? "..." : s.confirm}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
const CURRENCY_SYMBOLS: Record<string, string> = {
  nis: "₪",
  usd: "$",
  jod: "JD",
};
