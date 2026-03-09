import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { CURRENCY_SYMBOLS } from "../types";
import { EnrichedWalletSlot } from "../hooks/useUserWallets";
import { AppUser, Category, TransactionMode } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  mode: TransactionMode;
  amount: string;
  currency: string;
  recipient: AppUser | null;
  walletSlot: EnrichedWalletSlot | null;
  category: Category | null;
  note: string;
  loading: boolean;
  isRtl?: boolean;
  language?: "en" | "ar";
  onConfirm: () => void;
  onCancel: () => void;
}

// ─── Strings ──────────────────────────────────────────────────────────────────
const S = {
  en: {
    confirmSend: "Confirm Transfer",
    confirmRequest: "Confirm Request",
    to: "To",
    from: "From Wallet",
    amount: "Amount",
    category: "Category",
    note: "Note",
    noNote: "No note",
    confirm: "Confirm",
    cancel: "Cancel",
    processing: "Processing...",
  },
  ar: {
    confirmSend: "تأكيد التحويل",
    confirmRequest: "تأكيد الطلب",
    to: "إلى",
    from: "من محفظة",
    amount: "المبلغ",
    category: "الفئة",
    note: "ملاحظة",
    noNote: "لا توجد ملاحظة",
    confirm: "تأكيد",
    cancel: "إلغاء",
    processing: "جاري المعالجة...",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function ConfirmBottomSheet({
  visible,
  mode,
  amount,
  currency,
  recipient,
  walletSlot,
  category,
  note,
  loading,
  isRtl = false,
  language = "en",
  onConfirm,
  onCancel,
}: Props) {
  const s = S[language];
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["52%"], []);

  const symbol = CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();
  const parsedAmount = parseFloat(amount) || 0;

  // ── Open/Close on visible change ──────────────────────────────────────────
  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={onCancel}
      />
    ),
    [onCancel],
  );

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onCancel}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#DDD6FE", width: 40 }}
      backgroundStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
    >
      <BottomSheetView
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8 }}
      >
        {/* ── Title ── */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#1F2937",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          {mode === "send" ? s.confirmSend : s.confirmRequest}
        </Text>

        {/* ── Amount (big) ── */}
        <View
          style={{
            backgroundColor: "#F5F3FF",
            borderRadius: 20,
            paddingVertical: 20,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "#7C3AED", fontSize: 36, fontWeight: "bold" }}>
            {symbol}
            {parsedAmount.toFixed(2)}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4 }}>
            {currency.toUpperCase()}
          </Text>
        </View>

        {/* ── Details ── */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          {/* To */}
          <Row
            label={s.to}
            value={recipient?.name ?? "—"}
            sub={recipient?.number ? String(recipient.number) : undefined}
            isRtl={isRtl}
          />

          {/* From Wallet (Send only) */}
          {mode === "send" && walletSlot && (
            <Row label={s.from} value={walletSlot.slotName} isRtl={isRtl} />
          )}

          {/* Category */}
          {category && (
            <Row
              label={s.category}
              value={`${category.emoji} ${language === "ar" ? category.labelAr : category.label}`}
              isRtl={isRtl}
            />
          )}

          {/* Note */}
          <Row
            label={s.note}
            value={note.trim() || s.noNote}
            isRtl={isRtl}
            muted={!note.trim()}
          />
        </View>

        {/* ── Buttons ── */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 14,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#6B7280", fontWeight: "600", fontSize: 16 }}>
              {s.cancel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onConfirm}
            disabled={loading}
            style={{
              flex: 2,
              height: 52,
              borderRadius: 14,
              backgroundColor: "#7C3AED",
              alignItems: "center",
              justifyContent: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              {loading ? s.processing : s.confirm}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function Row({
  label,
  value,
  sub,
  isRtl,
  muted,
}: {
  label: string;
  value: string;
  sub?: string;
  isRtl: boolean;
  muted?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: isRtl ? "row-reverse" : "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
      }}
    >
      <Text style={{ color: "#9CA3AF", fontSize: 13 }}>{label}</Text>
      <View style={{ alignItems: isRtl ? "flex-start" : "flex-end" }}>
        <Text
          style={{
            color: muted ? "#9CA3AF" : "#1F2937",
            fontWeight: "600",
            fontSize: 14,
            fontStyle: muted ? "italic" : "normal",
          }}
        >
          {value}
        </Text>
        {sub && <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{sub}</Text>}
      </View>
    </View>
  );
}
