import { useI18n } from "@/hooks/use-i18n";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AmountInput } from "../components/AmountInput";
import { CategoryPicker } from "../components/CategoryPicker";
import { ConfirmBottomSheet } from "../components/ConfirmBottomSheet";
import {
  SegmentedControl,
  SegmentOption,
} from "../components/SegmentedControl";
import { UserPicker } from "../components/UserPicker";
import { WalletPicker } from "../components/WalletPicker";
import { useRequestMoney } from "../hooks/useRequestMoney";
import { useSendMoney } from "../hooks/useSendMoney";
import { EnrichedWalletSlot, useUserWallets } from "../hooks/useUserWallets";
import {
  AppUser,
  Category,
  Currency,
  CURRENCY_SYMBOLS,
  TransactionMode,
} from "../types/index";
// ─── Strings محلية للصفحة ─────────────────────────────────────────────────────
const TX_STRINGS = {
  en: {
    title: "Make a Transaction",
    sendMoney: "Send",
    receiveMoney: "Request",
    amount: "Amount",
    recipient: "Recipient",
    selectRecipient: "Who are you sending to?",
    payer: "Payer",
    selectPayer: "Who should pay you?",
    category: "Category",
    selectCategory: "Select category",
    noteOptional: "Note (Optional)",
    notePlaceholder: "Add a note...",
    sendBtn: "Send",
    requestBtn: "Request",
    mainWalletNote: "Funds go to recipient's main wallet automatically",
    requestNote: "Payer will receive a request to approve",
    successSend: "Money sent successfully! 🎉",
    successRequest: "Request sent! The payer will be notified. ⏳",
    fillRequired: "Please select a recipient and enter an amount.",
    errors: {
      INSUFFICIENT_FUNDS: "Insufficient funds in your wallet.",
      WALLET_INACTIVE: "Your wallet is inactive.",
      SENDER_IS_RECEIVER: "You cannot send money to yourself.",
      MAIN_WALLET_NOT_FOUND: "Recipient has no active wallet.",
      USER_NOT_FOUND: "User not found.",
      INVALID_AMOUNT: "Please enter a valid amount.",
      UNKNOWN: "Something went wrong. Please try again.",
    },
  },
  ar: {
    title: "إجراء معاملة",
    sendMoney: "إرسال",
    receiveMoney: "طلب",
    amount: "المبلغ",
    recipient: "المستلم",
    selectRecipient: "لمن تريد الإرسال؟",
    payer: "الدافع",
    selectPayer: "من سيدفع لك؟",
    category: "الفئة",
    selectCategory: "اختر الفئة",
    noteOptional: "ملاحظة (اختياري)",
    notePlaceholder: "أضف ملاحظة...",
    sendBtn: "إرسال",
    requestBtn: "طلب",
    mainWalletNote: "سيتم الإرسال للمحفظة الرئيسية للمستلم تلقائياً",
    requestNote: "سيصل الطلب للدافع للموافقة عليه",
    successSend: "تم الإرسال بنجاح! 🎉",
    successRequest: "تم إرسال الطلب! سيتم إبلاغ الدافع. ⏳",
    fillRequired: "الرجاء اختيار مستلم وإدخال المبلغ.",
    errors: {
      INSUFFICIENT_FUNDS: "الرصيد غير كافٍ في محفظتك.",
      WALLET_INACTIVE: "محفظتك غير نشطة.",
      SENDER_IS_RECEIVER: "لا يمكنك إرسال المال لنفسك.",
      MAIN_WALLET_NOT_FOUND: "المستلم ليس لديه محفظة نشطة.",
      USER_NOT_FOUND: "المستخدم غير موجود.",
      INVALID_AMOUNT: "الرجاء إدخال مبلغ صحيح.",
      UNKNOWN: "حدث خطأ ما. الرجاء المحاولة مرة أخرى.",
    },
  },
};

// ─── TODO: استبدل بـ Firebase Auth uid الحقيقي ───────────────────────────────
// مثال: const { user } = useAuth(); const CURRENT_USER_UID = user?.uid ?? "";
const CURRENT_USER_UID = "E8tBkcVIY4TEdk9jzSQFLn3zTF72";
const MAX_AMOUNT: Record<string, number> = {
  nis: 5000,
  jod: 1000,
  usd: 1500,
};

const MAX_NOTE_LENGTH = 150;

// ─── Component ────────────────────────────────────────────────────────────────
export default function MakeTransactionScreen() {
  const router = useRouter();
  const amountAnim = useRef(new Animated.Value(0)).current;

  const { language, isRtl } = useI18n();
  const s = TX_STRINGS[language as "en" | "ar"] ?? TX_STRINGS.en;

  // ── Mode ──────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<TransactionMode>("send");

  // ── Form state ────────────────────────────────────────────────────────────
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("nis");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState("");
  const [myWalletSlot, setMyWalletSlot] = useState<EnrichedWalletSlot | null>(
    null,
  );
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Data & Actions ────────────────────────────────────────────────────────
  const {
    execute: executeSend,
    loading: sendLoading,
    reset: resetSend,
  } = useSendMoney();
  const {
    execute: executeRequest,
    loading: requestLoading,
    reset: resetRequest,
  } = useRequestMoney();
  const { wallets: myWallets, loading: walletsLoading } =
    useUserWallets(CURRENT_USER_UID);
  const isLoading = sendLoading || requestLoading;

  // ── Mode animation ────────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // const handleModeChange = (newMode: TransactionMode) => {
  //   Animated.sequence([
  //     Animated.timing(fadeAnim, {
  //       toValue: 0,
  //       duration: 100,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(fadeAnim, {
  //       toValue: 1,
  //       duration: 200,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();
  //   setMode(newMode);
  //   setSelectedUser(null);
  // };

  const handleModeChange = (newMode: TransactionMode) => {
    if (newMode === mode) return;

    // إذا في بيانات مدخلة، اسأل المستخدم
    const hasData = amount || selectedUser || note || category || myWalletSlot;

    if (hasData) {
      Alert.alert(
        language === "ar" ? "تغيير الوضع" : "Switch Mode",
        language === "ar"
          ? "سيتم مسح البيانات المدخلة. هل تريد المتابعة؟"
          : "Entered data will be cleared. Continue?",
        [
          {
            text: language === "ar" ? "إلغاء" : "Cancel",
            style: "cancel",
          },
          {
            text: language === "ar" ? "متابعة" : "Continue",
            onPress: () => switchMode(newMode),
          },
        ],
      );
    } else {
      switchMode(newMode);
    }
  };

  const switchMode = (newMode: TransactionMode) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setMode(newMode);
    resetForm();
  };

  useEffect(() => {
    const shouldShow = mode === "receive" || !!myWalletSlot;

    if (shouldShow) {
      Animated.spring(amountAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      amountAnim.setValue(0);
    }
  }, [mode, myWalletSlot]);

  // useEffect(() => {
  //   if (myWalletSlot) {
  //     Animated.spring(amountAnim, {
  //       toValue: 1,
  //       useNativeDriver: true,
  //       tension: 100,
  //       friction: 8,
  //     }).start();
  //   } else {
  //     amountAnim.setValue(0);
  //   }
  // }, [myWalletSlot]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setAmount("");
    setSelectedUser(null);
    setCategory(null);
    setNote("");
    resetSend();
    resetRequest();
    setMyWalletSlot(null);
  }, [resetSend, resetRequest]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = (): string | null => {
    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) return s.errors.INVALID_AMOUNT;

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return s.errors.INVALID_AMOUNT;

    if (parsedAmount < 1) return s.errors.INVALID_AMOUNT;

    const max = MAX_AMOUNT[currency] ?? 5000;
    if (parsedAmount > max)
      return `Maximum amount is ${max} ${currency.toUpperCase()}`;

    if (mode === "send" && !myWalletSlot) return s.fillRequired;

    if (!selectedUser) return s.fillRequired;

    if (note.length > MAX_NOTE_LENGTH)
      return `Note cannot exceed ${MAX_NOTE_LENGTH} characters`;

    return null;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("", validationError);
      return;
    }
    setShowConfirm(true); // ← بس هذا، بدون أي await أو executeSend
  };

  // ── Confirm action from bottom sheet ─────────────────────────────────────
  const handleConfirm = async () => {
    const parsedAmount = parseFloat(amount);
    let success = false;

    if (mode === "send") {
      success = await executeSend({
        senderUid: CURRENT_USER_UID,
        fromSlotKey: myWalletSlot!.slotKey,
        receiverUid: selectedUser!.uid,
        amount: parsedAmount,
        currency,
        category: category?.key ?? "other",
        note,
      });
    } else {
      success = await executeRequest({
        requesterUid: CURRENT_USER_UID,
        payerUid: selectedUser!.uid,
        amount: parsedAmount,
        currency,
        category: category?.key ?? "other",
        note,
      });
    }

    if (success) {
      setShowConfirm(false);
      Alert.alert("✅", mode === "send" ? s.successSend : s.successRequest, [
        { text: "OK", onPress: resetForm },
      ]);
    }
  };

  // ── Button label ──────────────────────────────────────────────────────────
  const parsedAmount = parseFloat(amount) || 0;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();
  const submitLabel = `${mode === "send" ? s.sendBtn : s.requestBtn} ${symbol}${parsedAmount.toFixed(2)}`;

  const segmentOptions: SegmentOption<TransactionMode>[] = [
    { value: "send", label: s.sendMoney, icon: "➤" },
    { value: "receive", label: s.receiveMoney, icon: "📥" },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#7C3AED" }}>
        {/* ── Header ── */}
        <View
          style={{
            paddingTop: 56,
            paddingBottom: 16,
            paddingHorizontal: 24,
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
            {s.title}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/requests")}
            activeOpacity={0.7}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 7,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 14 }}>🔔</Text>
            <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>
              {language === "ar" ? "الطلبات" : "Requests"}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Segmented Control ── */}
            <View style={{ marginBottom: 24 }}>
              <SegmentedControl
                options={segmentOptions}
                value={mode}
                onChange={handleModeChange}
                isRtl={isRtl}
              />
            </View>

            <Animated.View style={{ opacity: fadeAnim, gap: 20 }}>
              {/* ── My Wallet (Send only) ── */}
              {mode === "send" && (
                <View style={{ minHeight: 0 }}>
                  <Label text="My Wallet" isRtl={isRtl} />
                  <WalletPicker
                    label="My Wallet"
                    placeholder="Select wallet to send from"
                    selectedSlot={myWalletSlot}
                    wallets={myWallets}
                    loading={walletsLoading}
                    onSelect={(slot) => {
                      setMyWalletSlot(slot);
                      setCurrency(
                        Object.keys(slot.wallet?.currancies ?? {})[0] ?? "nis",
                      );
                    }}
                    isRtl={isRtl}
                  />
                </View>
              )}
              {/* ── Amount ── */}
              {(mode === "receive" || (mode === "send" && myWalletSlot)) && (
                <Animated.View
                  style={{
                    opacity: amountAnim,
                    transform: [
                      {
                        translateY: amountAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <Label text={s.amount} isRtl={isRtl} />
                  <AmountInput
                    amount={amount}
                    currency={currency}
                    availableCurrencies={
                      mode === "send" && myWalletSlot?.wallet?.currancies
                        ? Object.keys(myWalletSlot.wallet.currancies)
                        : ["nis", "usd", "jod"]
                    }
                    onAmountChange={setAmount}
                    onCurrencyChange={setCurrency}
                    isRtl={isRtl}
                  />
                </Animated.View>
              )}

              {/* ── Recipient / Payer ── */}
              <View>
                <Label
                  text={mode === "send" ? s.recipient : s.payer}
                  isRtl={isRtl}
                />
                <UserPicker
                  label={mode === "send" ? s.recipient : s.payer}
                  placeholder={
                    mode === "send" ? s.selectRecipient : s.selectPayer
                  }
                  selectedUser={selectedUser}
                  currentUserUid={CURRENT_USER_UID}
                  onSelect={setSelectedUser}
                  isRtl={isRtl}
                  language={language as "en" | "ar"}
                />
                {/* Info note */}
                <Text
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 12,
                    marginTop: 6,
                    marginLeft: isRtl ? 0 : 4,
                    marginRight: isRtl ? 4 : 0,
                    textAlign: isRtl ? "right" : "left",
                  }}
                >
                  ℹ️ {mode === "send" ? s.mainWalletNote : s.requestNote}
                </Text>
              </View>

              {/* ── Category ── */}
              <View>
                <Label text={s.category} isRtl={isRtl} />
                <CategoryPicker
                  label={s.selectCategory}
                  selected={category}
                  onSelect={setCategory}
                  isRtl={isRtl}
                  language={language}
                />
              </View>

              {/* ── Note ── */}
              <View>
                <Label text={s.noteOptional} isRtl={isRtl} />
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    minHeight: 90,
                    shadowColor: "#000",
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder={s.notePlaceholder}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    textAlign={isRtl ? "right" : "left"}
                    style={{ color: "#1F2937", fontSize: 16, lineHeight: 22 }}
                  />
                  <Text
                    style={{
                      textAlign: "right",
                      fontSize: 11,
                      color:
                        note.length > MAX_NOTE_LENGTH ? "#EF4444" : "#9CA3AF",
                      marginTop: 4,
                    }}
                  >
                    {note.length}/{MAX_NOTE_LENGTH}
                  </Text>
                </View>
              </View>

              {/* ── Submit Button ── */}
              <SubmitButton
                label={submitLabel}
                onPress={handleSubmit}
                loading={isLoading}
                mode={mode}
              />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
        <ConfirmBottomSheet
          visible={showConfirm}
          mode={mode}
          amount={amount}
          currency={currency}
          recipient={selectedUser}
          walletSlot={myWalletSlot}
          category={category}
          note={note}
          loading={isLoading}
          isRtl={isRtl}
          language={language as "en" | "ar"}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      </View>
    </GestureHandlerRootView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ text, isRtl }: { text: string; isRtl: boolean }) {
  return (
    <Text
      style={{
        color: "rgba(255,255,255,0.85)",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 8,
        marginLeft: isRtl ? 0 : 4,
        marginRight: isRtl ? 4 : 0,
        textAlign: isRtl ? "right" : "left",
      }}
    >
      {text}
    </Text>
  );
}

function SubmitButton({
  label,
  onPress,
  loading,
  mode,
}: {
  label: string;
  onPress: () => void;
  loading: boolean;
  mode: TransactionMode;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 8 }}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }).start()
        }
        disabled={loading}
        style={{
          backgroundColor: mode === "send" ? "white" : "#5B21B6",
          borderRadius: 16,
          height: 64,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 4,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text style={{ fontSize: 20 }}>{mode === "send" ? "➤" : "📥"}</Text>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            color: mode === "send" ? "#7C3AED" : "white",
          }}
        >
          {loading ? "Loading..." : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
