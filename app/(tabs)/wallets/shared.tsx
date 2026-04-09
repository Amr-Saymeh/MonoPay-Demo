import React, { useEffect, useMemo, useRef, useState } from "react";

import { ThemedView } from "@/components/themed-view";
import { SharedCard } from '@/src/features/card/SharedCard';

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { onValue, push, ref, update } from "firebase/database";
import {
    ActivityIndicator,
    Alert,
    Animated,
    InputAccessoryView,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { db } from "@/src/firebaseConfig";
import { useAuth } from "@/src/providers/AuthProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

type WalletRecord = {
  id?: number;
  state?: string;
  type?: string;
  currancies?: Record<string, number>;
  ownerUid?: string;
  members?: Record<string, true>;
  goal?: string;
};

type UserProfile = {
  name?: string;
  email?: string;
  number?: string | number;
  type?: number;
};

type SharedLog = {
  id: string;
  userUid: string;
  amount: number;
  currency: string;
  reason: string;
  createdAt: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(code: string) {
  return code.trim().toUpperCase();
}

function formatAmount(value: number) {
  return Number(value).toFixed(2);
}

function getTotalBalance(currancies?: Record<string, number>) {
  return Object.values(currancies ?? {}).reduce((sum, value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);
}

function getNextUserWalletKey(userWallets: Record<string, unknown>) {
  const maxIndex = Object.keys(userWallets).reduce((acc, key) => {
    const match = /^wallet(\d+)$/.exec(key);
    if (!match) return acc;
    const idx = Number(match[1]);
    return Number.isFinite(idx) ? Math.max(acc, idx) : acc;
  }, 0);
  return `wallet${Math.max(1, maxIndex + 1)}`;
}

// ─── Animation hook ───────────────────────────────────────────────────────────

function useFadeSlide(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateX }] };
}

// ─── UserRow ──────────────────────────────────────────────────────────────────

function UserRow({
  uid, profile, isOwnerMember, canRemove, onRemove, index, isLast,
}: {
  uid: string;
  profile?: UserProfile;
  isOwnerMember: boolean;
  canRemove: boolean;
  onRemove: () => void;
  index: number;
  isLast: boolean;
}) {
  const anim = useFadeSlide(index * 55 + 60);
  const label = profile?.name?.trim() || profile?.email?.trim() || uid;

  return (
    <Animated.View style={[styles.userRow, !isLast && styles.userRowBorder, anim]}>
      <View style={styles.userInfo}>
        <LinearGradient
          colors={["#a78bfa", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userAvatar}
        >
          <MaterialIcons name="person" size={14} color="#fff" />
        </LinearGradient>
        <ThemedText style={styles.username} numberOfLines={1}>{label}</ThemedText>
      </View>

      {isOwnerMember ? (
        <View style={styles.ownerTag}>
          <ThemedText style={styles.ownerTagText}>OWNER</ThemedText>
        </View>
      ) : canRemove ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRemove}
          style={styles.removeBtn}
        >
          <MaterialIcons name="person-remove" size={16} color="#DC2626" />
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
}

// ─── HistoryRow ───────────────────────────────────────────────────────────────

function HistoryRow({
  item, index, isLast, actorLabel,
}: {
  item: SharedLog;
  index: number;
  isLast: boolean;
  actorLabel: string;
}) {
  const anim = useFadeSlide(index * 55 + 260);
  const isPositive = item.amount >= 0;
  const date = new Date(item.createdAt);

  return (
    <Animated.View style={[styles.historyRow, !isLast && styles.historyRowBorder, anim]}>
      <View style={[styles.historyDot, { backgroundColor: isPositive ? "#a78bfa" : "#c084fc" }]} />
      <View style={styles.historyInfo}>
        <ThemedText style={styles.historyText} numberOfLines={1}>
          {item.reason || (isPositive ? "Add money" : "Spend")}
        </ThemedText>
        <ThemedText style={styles.historySub} numberOfLines={1}>
          {actorLabel} · {date.toLocaleDateString()}
        </ThemedText>
      </View>
      <ThemedText style={[styles.historyAmount, isPositive ? styles.amountPositive : styles.amountNegative]}>
        {isPositive ? "+" : ""}
        {formatAmount(item.amount)} {formatCurrency(item.currency)}
      </ThemedText>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SharedWalletScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ walletId?: string }>();

  const walletId = useMemo(() => Number(params.walletId ?? NaN), [params.walletId]);

  const [wallet, setWallet] = useState<WalletRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");

  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>({});
  const [memberUids, setMemberUids] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const [amountModalVisible, setAmountModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [amountCurrency, setAmountCurrency] = useState<string | null>(null);
  const [amountReason, setAmountReason] = useState("");
  const [amountIsAdd, setAmountIsAdd] = useState(true);
  const [savingAmount, setSavingAmount] = useState(false);

  const [logs, setLogs] = useState<SharedLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const isOwner = !!user && !!wallet?.ownerUid && wallet.ownerUid === user.uid;

  // ── Firebase: wallet ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !Number.isFinite(walletId)) { setLoading(false); return; }
    const walletKey = `wallet${walletId}`;
    const unsub = onValue(
      ref(db, `wallets/${walletKey}`),
      (snap) => {
        const value = (snap.val() ?? null) as WalletRecord | null;
        if (!value || String(value.type ?? "") !== "shared") {
          setWallet(null); setLoading(false); return;
        }
        setWallet(value);
        setName(`Wallet ${walletId}`);
        setGoal(value.goal ?? "");
        setMemberUids(Object.keys(value.members ?? {}));
        setLoading(false);
      },
      () => { setWallet(null); setLoading(false); },
    );
    return () => unsub();
  }, [user, walletId]);

  // ── Firebase: logs ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !Number.isFinite(walletId)) return;
    setLogsLoading(true);
    const walletKey = `wallet${walletId}`;
    const unsub = onValue(
      ref(db, `wallets/${walletKey}/sharedLogs`),
      (snap) => {
        const raw = (snap.val() ?? {}) as Record<string, any>;
        const list: SharedLog[] = Object.entries(raw)
          .map(([id, v]) => ({
            id,
            userUid: String(v.userUid ?? ""),
            amount: Number(v.amount) || 0,
            currency: String(v.currency ?? "").toLowerCase(),
            reason: String(v.reason ?? ""),
            createdAt: Number(v.createdAt) || 0,
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setLogs(list);
        setLogsLoading(false);
      },
      () => { setLogs([]); setLogsLoading(false); },
    );
    return () => unsub();
  }, [user, walletId]);

  // ── Firebase: all users ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await import("firebase/database").then(({ get }) =>
          get(ref(db, "users")),
        );
        if (cancelled) return;
        setAllUsers((snap.val?.() ?? {}) as Record<string, UserProfile>);
      } catch { if (!cancelled) setAllUsers({}); }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const memberProfiles = useMemo(
    () => memberUids.map((uid) => ({ uid, profile: allUsers[uid] })),
    [allUsers, memberUids],
  );

  const suggestions = useMemo(() => {
    if (!isOwner) return [] as Array<{ uid: string; profile: UserProfile }>;
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const selected = new Set(memberUids);
    return Object.entries(allUsers)
      .filter(([uid, profile]) => {
        if (uid === user?.uid || selected.has(uid) || profile?.type !== 1) return false;
        const n = String(profile?.name ?? "").toLowerCase();
        const e = String(profile?.email ?? "").toLowerCase();
        const num = String(profile?.number ?? "").toLowerCase();
        return n.includes(q) || e.includes(q) || num.includes(q);
      })
      .slice(0, 10)
      .map(([uid, profile]) => ({ uid, profile }));
  }, [allUsers, isOwner, memberUids, search, user?.uid]);

  const balances = useMemo(
    () => Object.entries(wallet?.currancies ?? {})
      .filter(([k, v]) => k && Number.isFinite(Number(v)))
      .sort(([a], [b]) => a.localeCompare(b)),
    [wallet?.currancies],
  );

  const availableCurrencies = useMemo(() => {
    if (amountIsAdd) return ["usd", "eur", "ils", "jod", "egp"];
    return balances.map(([code]) => code.toLowerCase());
  }, [amountIsAdd, balances]);

  const totalBalance = useMemo(() => getTotalBalance(wallet?.currancies), [wallet?.currancies]);
  const ownerProfile = useMemo(() => (wallet?.ownerUid ? allUsers[wallet.ownerUid] : undefined), [allUsers, wallet?.ownerUid]);
  const walletState = String(wallet?.state ?? "active").toLowerCase();
  const ownerLabel = ownerProfile?.name?.trim() || ownerProfile?.email?.trim() || wallet?.ownerUid || "—";

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveMeta = async () => {
    if (!user || !wallet || !Number.isFinite(walletId)) return;
    if (!isOwner) { Alert.alert(t("error"), t("onlyOwnerCanEdit") ?? "Only the owner can edit."); return; }
    try {
      await update(ref(db), { [`wallets/wallet${walletId}/goal`]: goal.trim() || null });
      Alert.alert(t("saved"), t("changesSaved") ?? "Changes saved.");
    } catch (e) { Alert.alert(t("error"), e instanceof Error ? e.message : "Failed"); }
  };

  const handleAddMember = async (uid: string) => {
    if (!user || !wallet || !Number.isFinite(walletId) || !isOwner) return;
    const walletKey = `wallet${walletId}`;
    const updates: Record<string, unknown> = { [`wallets/${walletKey}/members/${uid}`]: true };
    try {
      const { get } = await import("firebase/database");
      const snap = await get(ref(db, `users/${uid}/userwallet`));
      const userWallets = (snap.val() ?? {}) as Record<string, { walletid?: number }>;
      if (!Object.values(userWallets).some((w) => Number(w?.walletid) === walletId)) {
        updates[`users/${uid}/userwallet/${getNextUserWalletKey(userWallets)}`] = {
          name: name.trim() || `Wallet ${walletId}`,
          walletid: walletId,
        };
      }
      await update(ref(db), updates);
      setMemberUids((prev) => (prev.includes(uid) ? prev : [...prev, uid]));
      setSearch("");
    } catch (e) { Alert.alert(t("error"), e instanceof Error ? e.message : "Failed"); }
  };

  const handleRemoveMember = async (uid: string) => {
    if (!user || !wallet || !Number.isFinite(walletId) || !isOwner || uid === wallet.ownerUid) return;
    const walletKey = `wallet${walletId}`;
    const updates: Record<string, unknown> = { [`wallets/${walletKey}/members/${uid}`]: null };
    try {
      const { get } = await import("firebase/database");
      const snap = await get(ref(db, `users/${uid}/userwallet`));
      const userWallets = (snap.val() ?? {}) as Record<string, { walletid?: number }>;
      for (const [slotKey, link] of Object.entries(userWallets)) {
        if (Number(link?.walletid) === walletId) updates[`users/${uid}/userwallet/${slotKey}`] = null;
      }
      await update(ref(db), updates);
      setMemberUids((prev) => prev.filter((x) => x !== uid));
    } catch (e) { Alert.alert(t("error"), e instanceof Error ? e.message : "Failed"); }
  };

  const openAmountModal = (isAdd: boolean, currency?: string) => {
    setAmountIsAdd(isAdd);
    setAmount("");
    setAmountReason("");
    const defaultCur = isAdd ? "ils" : (balances[0]?.[0] ?? null);
    setAmountCurrency(currency ?? defaultCur);
    setAmountModalVisible(true);
  };

  const handleSaveAmount = async () => {
    if (!user || !wallet || !Number.isFinite(walletId) || !amountCurrency) return;
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert(t("error"), t("invalidAmount") ?? "Enter a valid amount."); return;
    }
    const delta = amountIsAdd ? value : -value;
    const walletKey = `wallet${walletId}`;
    setSavingAmount(true);
    try {
      const { get } = await import("firebase/database");
      const snap = await get(ref(db, `wallets/${walletKey}/currancies`));
      const curr = (snap.val() ?? {}) as Record<string, number>;
      const key = amountCurrency.toLowerCase();
      const next = Number(curr[key] ?? 0) + delta;
      if (next < 0) {
        Alert.alert(t("error"), t("insufficientFunds") ?? "Not enough balance.");
        setSavingAmount(false); return;
      }
      const logsRef = ref(db, `wallets/${walletKey}/sharedLogs`);
      const logRef = push(logsRef);
      await update(ref(db), {
        [`wallets/${walletKey}/currancies/${key}`]: next,
        [`wallets/${walletKey}/sharedLogs/${logRef.key}`]: {
          userUid: user.uid,
          amount: delta,
          currency: key,
          reason: amountReason.trim() || (amountIsAdd ? "Add money" : "Spend"),
          createdAt: Date.now(),
        },
      });
      setAmountModalVisible(false);
    } catch (e) { Alert.alert(t("error"), e instanceof Error ? e.message : "Failed"); }
    finally { setSavingAmount(false); }
  };


// __ ca
const cardCurrencies = useMemo(
  () =>
    Object.entries(wallet?.currancies ?? {})
      .map(([code, balance]) => ({ code, balance: Number(balance) }))
      .filter(({ balance }) => Number.isFinite(balance)),
  [wallet?.currancies],
);
  // ── Guard screens ─────────────────────────────────────────────────────────
  if (!user) return <ThemedView style={styles.screen}><ThemedText type="subtitle">{t("pleaseSignIn")}</ThemedText></ThemedView>;
  if (!Number.isFinite(walletId)) return <ThemedView style={styles.screen}><ThemedText type="subtitle">{t("walletNotFound") ?? "Wallet not found"}</ThemedText></ThemedView>;
  if (loading) return <ThemedView style={styles.screen}><View style={styles.center}><ActivityIndicator /></View></ThemedView>;
  if (!wallet || String(wallet.type ?? "") !== "shared") return <ThemedView style={styles.screen}><ThemedText type="subtitle">{t("walletNotFound") ?? "Wallet not found"}</ThemedText></ThemedView>;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ThemedView style={styles.screen}>

      {/* ── Back button — new pill design ── */}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.cardWrapper}>

            <SharedCard
               name={name}
               ownerLabel={ownerLabel}
               memberUids={memberUids}
               walletState={walletState}
               currencies={cardCurrencies}

          />
  
</View>


        {/* ── Members + Add/Remove money buttons ── */}
        <ThemedView style={styles.sectionCard}>

          {/* Pill header — new design */}
          <View style={styles.pillHeader}>
            <ThemedText style={styles.pillHeaderText}>{t("members") ?? "Members"}</ThemedText>
          </View>


          {isOwner && (
            <View style={styles.memberSearchSection}>
              <View style={styles.divider} />

              <AuthInput
                value={search}
                onChangeText={setSearch}
                placeholder={t("searchByNameOrNumber") ?? "Search by name, phone or email"}
              />
              {suggestions.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {suggestions.map(({ uid, profile }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      key={uid}
                      onPress={() => handleAddMember(uid)}
                      style={styles.suggestionRow}
                    >
                      <LinearGradient
                        colors={["#a78bfa", "#7c3aed"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.suggestionAvatar}
                      >
                        <MaterialIcons name="person-add-alt-1" size={14} color="#fff" />
                      </LinearGradient>
                      <View style={styles.suggestionInfo}>
                        <ThemedText style={{ fontFamily: Fonts.sansBold }} numberOfLines={1}>
                          {profile?.name ?? "Unnamed"}
                        </ThemedText>
                        <ThemedText style={styles.suggestionSub} numberOfLines={1}>
                          {profile?.email ?? profile?.number ?? uid}
                        </ThemedText>
                      </View>
                      <MaterialIcons name="chevron-right" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {search.trim().length > 0 && suggestions.length === 0 && (
                <ThemedText style={styles.helperText}>{t("noResults") ?? "No matching users found."}</ThemedText>
              )}
            </View>
          )}

          {/* Users list — left border style */}
          <View style={styles.leftBorder}>
            {memberProfiles.length === 0 ? (
              <ThemedText style={styles.emptyText}>No members yet.</ThemedText>
            ) : memberProfiles.map(({ uid, profile }, index) => (
              <UserRow
                key={uid}
                uid={uid}
                profile={profile}
                isOwnerMember={uid === wallet.ownerUid}
                canRemove={isOwner}
                onRemove={() => handleRemoveMember(uid)}
                index={index}
                isLast={index === memberProfiles.length - 1}
              />
            ))}
          </View>

          <View style={styles.divider} />

          {/* Add money / Remove money — new pill button design */}

          <View style={styles.pillHeader}>
            <ThemedText style={styles.pillHeaderText}>{t("balance") ?? "Money"}</ThemedText>
          </View>

          <View style={styles.actionBtns}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.btn, styles.btnAdd]}
              onPress={() => openAmountModal(true)}
            >
              <ThemedText style={styles.btnText}>+ {"add money"}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.btn, styles.btnRemove]}
              onPress={() => openAmountModal(false)}
            >
              <ThemedText style={styles.btnText}>− {"remove money"}</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Add member search — owner only */}

        </ThemedView>

        {/* ── History log — left border style ── */}
        <ThemedView style={styles.sectionCard}>
          <View style={styles.pillHeader}>
            <ThemedText style={styles.pillHeaderText}>{t("history") ?? "History"}</ThemedText>
          </View>

          {logsLoading ? (
            <View style={styles.center}><ActivityIndicator /></View>
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

      </ScrollView>

      {/* ── Amount Modal — logic unchanged, style refreshed ── */}
      <Modal
        visible={amountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAmountModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setAmountModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />

            <ThemedText type="subtitle" style={styles.modalTitle}>
              {amountIsAdd ? t("add money") ?? "Add money" : t("spendMoney") ?? "Spend money"}
            </ThemedText>

            <ThemedText style={styles.sectionTitle}>{t("amount") ?? "Amount"}</ThemedText>
            <AuthInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" inputAccessoryViewID="amount_input_accessory" />

            <ThemedText style={[styles.sectionTitle, { marginTop: 6 }]}>{t("currency") ?? "Currency"}</ThemedText>
            <View style={styles.currencyChipsRow}>
              {availableCurrencies.map((code) => {
                const isSelected =
                  formatCurrency(amountCurrency ?? balances[0]?.[0] ?? "nis") === formatCurrency(code);
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    key={code}
                    onPress={() => setAmountCurrency(code)}
                    style={[
                      styles.currencyChip,
                      isSelected && styles.currencyChipSelected,
                    ]}
                  >
                    <ThemedText style={[styles.currencyChipText, isSelected && styles.currencyChipTextSelected]}>
                      {formatCurrency(code)}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ThemedText style={[styles.sectionTitle, { marginTop: 6 }]}>{t("noteOptional") ?? "Note (optional)"}</ThemedText>
            <TextInput
              value={amountReason}
              onChangeText={setAmountReason}
              placeholder={t("reasonPlaceholder") ?? "Why?"}
              style={styles.noteInput}
              multiline
            />

            <GradientButton
              label={savingAmount ? t("saving") ?? "Saving..." : t("confirm") ?? "Confirm"}
              onPress={handleSaveAmount}
              disabled={savingAmount}
              loading={savingAmount}
              style={styles.modalPrimaryButton}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAmountModalVisible(false)}
              style={styles.modalSecondaryButton}
            >
              <ThemedText style={styles.modalSecondaryText}>{t("cancel") ?? "Cancel"}</ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>

        {Platform.OS === "ios" && (
          <InputAccessoryView nativeID="amount_input_accessory">
            <View style={{ backgroundColor: "#F8FAFC", alignItems: "flex-end", paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "rgba(17,24,28,0.08)" }}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => Keyboard.dismiss()}>
                <MaterialIcons name="check-circle" size={28} color="#a855f7" />
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
        )}
      </Modal>

    </ThemedView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 16, paddingHorizontal: 16 },
  center: { paddingVertical: 32, alignItems: "center" },
  content: { paddingBottom: 40, gap: 14 },
  pressed: { opacity: 0.82 },

  // ── Back button — new pill style ──
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#3d3a52",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 16,
  },
  backBtnText: { color: "#f0eff5", fontSize: 13, fontFamily: Fonts.sansBold },

  // ── Card — new purple gradient ──
  cardWrapper: {
    borderRadius: 22,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  cardDetails: { borderRadius: 22, padding: 18, overflow: "hidden", gap: 10 },
  cardCircleTopRight: {
    position: "absolute", top: -30, right: -30,
    width: 120, height: 120,
    backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 60,
  },
  cardCircleBottomLeft: {
    position: "absolute", bottom: -20, left: 20,
    width: 80, height: 80,
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 40,
  },
  cardChip: {
    position: "absolute", top: 18, left: 20,
    width: 32, height: 24,
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 5,
  },
  cardDots: { position: "absolute", bottom: 70, left: 20, flexDirection: "row", gap: 5 },
  cardDot: { width: 6, height: 6, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 3 },
  cardBody: { marginTop: 24, gap: 6 },
  cardWalletName: { color: "#fff", fontSize: 17, fontFamily: Fonts.sansBlack },
  cardGoal: { color: "rgba(255,255,255,0.75)", fontSize: 13 },
  cardBadgeRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  cardPill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  cardPillActive: { backgroundColor: "rgba(34,197,94,0.2)" },
  cardPillInactive: { backgroundColor: "rgba(239,68,68,0.2)" },
  cardPillInfo: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  cardPillText: { color: "#fff", fontSize: 11 },
  cardStatsRow: { flexDirection: "row", gap: 10 },
  cardStat: {
    flex: 1, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    padding: 10, gap: 4,
  },
  cardStatLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  cardStatValue: { color: "#fff", fontFamily: Fonts.sansBold, fontSize: 13 },

  // ── Section cards ──
  sectionCard: {
    borderRadius: 18, padding: 16, gap: 12,
    borderWidth: 1, borderColor: "rgba(17,24,28,0.08)",
    backgroundColor: "rgba(17,24,28,0.03)",
  },
  sectionTitle: { opacity: 0.65, fontFamily: Fonts.sansBold },

  // ── Pill section header — new design ──
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

  // ── Left border list container ──
  leftBorder: {
    borderLeftWidth: 2.5,
    borderLeftColor: "#a78bfa",
    paddingLeft: 14,
  },

  // ── User row ──
  userRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 10,
  },
  userRowBorder: { borderBottomWidth: 1, borderBottomColor: "#e2dff0" },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  userAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  username: { fontSize: 14, flex: 1 },
  ownerTag: {
    backgroundColor: "#c084fc", borderRadius: 20,
    paddingVertical: 3, paddingHorizontal: 10,
  },
  ownerTagText: { color: "#fff", fontSize: 10, fontFamily: Fonts.sansBold, letterSpacing: 0.5 },
  removeBtn: {
    width: 32, height: 32, borderRadius: 999,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(220,38,38,0.10)",
  },

  // ── Add/Remove money buttons — new pill design ──
  actionBtns: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1, paddingVertical: 13, borderRadius: 50,
    alignItems: "center", justifyContent: "center",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  btnAdd: { backgroundColor: "#a855f7", shadowColor: "#a855f7" },
  btnRemove: { backgroundColor: "#c084fc", shadowColor: "#c084fc" },
  btnText: { color: "#fff", fontSize: 13, fontFamily: Fonts.sansBold, letterSpacing: 0.3 },

  // ── History row ──
  historyRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10 },
  historyRowBorder: { borderBottomWidth: 1, borderBottomColor: "#e2dff0" },
  historyDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  historyInfo: { flex: 1 },
  historyText: { fontSize: 13 },
  historySub: { fontSize: 11, opacity: 0.6, marginTop: 2 },
  historyAmount: { fontSize: 12, fontFamily: Fonts.sansBold },
  amountPositive: { color: "#7c3aed" },
  amountNegative: { color: "#c084fc" },

  // ── Detail rows ──
  detailRow: { flexDirection: "row", justifyContent: "space-between", gap: 14 },
  detailLabel: { opacity: 0.65, flex: 1 },
  detailValue: { flex: 1, textAlign: "right", fontFamily: Fonts.sansBold },
  divider: { height: 1, backgroundColor: "rgba(17,24,28,0.08)" },
  goalSection: { gap: 10 },
  goalButton: { marginTop: 2 },
  helperText: { opacity: 0.65, fontSize: 13 },
  emptyText: { opacity: 0.65 },

  // ── Balances ──
  balanceList: { gap: 10 },
  balanceCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    gap: 12, padding: 14, borderRadius: 16,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "rgba(17,24,28,0.06)",
  },
  balanceCode: { opacity: 0.65, marginBottom: 4 },
  balanceValue: { fontSize: 18, fontFamily: Fonts.sansBold },
  balanceActions: { flexDirection: "row", gap: 8 },
  balanceActionBtn: { width: 38, height: 38, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  balanceActionAdd: { backgroundColor: "rgba(34,197,94,0.12)" },
  balanceActionSpend: { backgroundColor: "rgba(239,68,68,0.12)" },

  // ── Member search ──
  memberSearchSection: { gap: 10 },
  suggestionsBox: {
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(17,24,28,0.08)",
    overflow: "hidden", backgroundColor: "#fff",
  },
  suggestionRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(17,24,28,0.06)",
  },
  suggestionAvatar: { width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  suggestionInfo: { flex: 1 },
  suggestionSub: { opacity: 0.6, marginTop: 2, fontSize: 13 },

  // ── Modal ──
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 10,
  },
  modalHandle: {
    alignSelf: "center", width: 40, height: 4,
    borderRadius: 2, backgroundColor: "#E5E7EB", marginVertical: 8,
  },
  modalTitle: { marginBottom: 8 },
  currencyChipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  currencyChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: "rgba(17,24,28,0.12)", backgroundColor: "#F8FAFC",
  },
  currencyChipSelected: { borderColor: "#7c3aed", backgroundColor: "rgba(124,58,237,0.09)" },
  currencyChipText: { fontSize: 13, color: "#111827" },
  currencyChipTextSelected: { color: "#7c3aed" },
  noteInput: {
    borderWidth: 1, borderColor: "rgba(17,24,28,0.10)", borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 10,
    minHeight: 80, textAlignVertical: "top", backgroundColor: "#fff",
  },
  modalPrimaryButton: { marginTop: 16 },
  modalSecondaryButton: {
    height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(17,24,28,0.10)", marginTop: 10, backgroundColor: "#fff",
  },
  modalSecondaryText: { color: "rgba(17,24,28,0.75)", fontFamily: Fonts.sansBold },
});