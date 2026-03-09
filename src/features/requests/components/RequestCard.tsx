import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CURRENCY_SYMBOLS } from "@/src/features/transfer/types";
import { MoneyRequestItem, RequestStatus } from "../hooks/useMoneyRequests";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; labelAr: string; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    labelAr: "انتظار",
    color: "#D97706",
    bg: "#FEF3C7",
  },
  approved: {
    label: "Approved",
    labelAr: "مكتمل",
    color: "#059669",
    bg: "#D1FAE5",
  },
  rejected: {
    label: "Rejected",
    labelAr: "مرفوض",
    color: "#DC2626",
    bg: "#FEE2E2",
  },
  cancelled: {
    label: "Cancelled",
    labelAr: "ملغي",
    color: "#6B7280",
    bg: "#F3F4F6",
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  food: "🍔",
  transport: "🚗",
  shopping: "🛍️",
  bills: "📄",
  health: "💊",
  education: "📚",
  entertainment: "🎬",
  family: "👨‍👩‍👧",
  savings: "🏦",
  other: "💸",
};

interface Props {
  item: MoneyRequestItem;
  mode: "received" | "sent";
  language: "en" | "ar";
  isRtl: boolean;
  onApprove?: (item: MoneyRequestItem) => void;
  onReject?: (item: MoneyRequestItem) => void;
  onCancel?: (item: MoneyRequestItem) => void;
}

export function RequestCard({
  item,
  mode,
  language,
  isRtl,
  onApprove,
  onReject,
  onCancel,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const status = STATUS_CONFIG[item.status];
  const symbol = CURRENCY_SYMBOLS[item.currancy] ?? item.currancy.toUpperCase();
  const categoryIcon = CATEGORY_ICONS[item.category] ?? "💸";
  const initials = (item.otherPartyName ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const date = new Date(item.createdAt).toLocaleDateString(
    language === "ar" ? "ar-EG" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );

  const avatarColors = ["#7C3AED", "#0EA5E9", "#059669", "#D97706", "#DC2626"];
  const avatarColor =
    avatarColors[initials.charCodeAt(0) % avatarColors.length];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 20,
          marginBottom: 12,
          shadowColor: "#7C3AED",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
          overflow: "hidden",
        }}
      >
        {/* ── Top accent bar based on status ── */}
        <View style={{ height: 3, backgroundColor: status.color }} />

        <View style={{ padding: 16 }}>
          {/* ── Header row ── */}
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            {/* Avatar */}
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: avatarColor,
                alignItems: "center",
                justifyContent: "center",
                marginRight: isRtl ? 0 : 12,
                marginLeft: isRtl ? 12 : 0,
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                {initials}
              </Text>
            </View>

            {/* Name + number */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#1F2937",
                  fontWeight: "700",
                  fontSize: 15,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {item.otherPartyName ?? "—"}
              </Text>
              {item.otherPartyNumber && (
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 12,
                    textAlign: isRtl ? "right" : "left",
                  }}
                >
                  {item.otherPartyNumber}
                </Text>
              )}
            </View>

            {/* Status badge */}
            <View
              style={{
                backgroundColor: status.bg,
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{ color: status.color, fontSize: 11, fontWeight: "600" }}
              >
                {language === "ar" ? status.labelAr : status.label}
              </Text>
            </View>
          </View>

          {/* ── Amount ── */}
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              marginBottom: 10,
              gap: 8,
            }}
          >
            <Text
              style={{ fontSize: 28, fontWeight: "bold", color: "#7C3AED" }}
            >
              {symbol}
              {item.amount.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>
              {item.currancy.toUpperCase()}
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={{ fontSize: 20 }}>{categoryIcon}</Text>
          </View>

          {/* ── Note ── */}
          {!!item.note && (
            <Text
              style={{
                color: "#6B7280",
                fontSize: 13,
                fontStyle: "italic",
                marginBottom: 10,
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {`"${item.note}"`}
            </Text>
          )}

          {/* ── Date ── */}
          <Text
            style={{
              color: "#9CA3AF",
              fontSize: 11,
              textAlign: isRtl ? "right" : "left",
              marginBottom: item.status === "pending" ? 12 : 0,
            }}
          >
            {date}
          </Text>

          {/* ── Action Buttons ── */}
          {item.status === "pending" && mode === "received" && (
            <View
              style={{ flexDirection: isRtl ? "row-reverse" : "row", gap: 8 }}
            >
              <TouchableOpacity
                onPress={() => onReject?.(item)}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#FEE2E2",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{ color: "#DC2626", fontWeight: "600", fontSize: 14 }}
                >
                  {language === "ar" ? "✗ رفض" : "✗ Reject"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onApprove?.(item)}
                style={{
                  flex: 2,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#7C3AED",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 14 }}
                >
                  {language === "ar" ? "✓ موافقة" : "✓ Approve"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {item.status === "pending" && mode === "sent" && (
            <TouchableOpacity
              onPress={() => onCancel?.(item)}
              style={{
                height: 40,
                borderRadius: 12,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{ color: "#6B7280", fontWeight: "600", fontSize: 14 }}
              >
                {language === "ar" ? "إلغاء الطلب" : "Cancel Request"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
