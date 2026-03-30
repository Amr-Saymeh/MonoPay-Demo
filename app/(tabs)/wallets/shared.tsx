import React, { useEffect, useMemo, useState } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { onValue, push, ref, update } from "firebase/database";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { db } from "@/src/firebaseConfig";
import { useAuth } from "@/src/providers/AuthProvider";

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

function formatCurrency(code: string) {
  return code.trim().toUpperCase();
}

export default function SharedWalletScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ walletId?: string }>();

  const walletId = useMemo(
    () => Number(params.walletId ?? NaN),
    [params.walletId],
  );

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

  useEffect(() => {
    if (!user || !Number.isFinite(walletId)) {
      setLoading(false);
      return;
    }

    const walletKey = `wallet${walletId}`;
    const unsub = onValue(
      ref(db, `wallets/${walletKey}`),
      (snap) => {
        const value = (snap.val() ?? null) as WalletRecord | null;
        if (!value || String(value.type ?? "") !== "shared") {
          setWallet(null);
          setLoading(false);
          return;
        }
        setWallet(value);
        setName(
          // name lives on userwallet links; fall back to generic label
          `Wallet ${walletId}`,
        );
        setGoal(value.goal ?? "");
        setMemberUids(Object.keys(value.members ?? {}));
        setLoading(false);
      },
      () => {
        setWallet(null);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user, walletId]);

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
      () => {
        setLogs([]);
        setLogsLoading(false);
      },
    );

    return () => unsub();
  }, [user, walletId]);

  useEffect(() => {
    if (!user) return;
    if (!isOwner) return;

    let cancelled = false;
    (async () => {
      try {
        const snap = await import("firebase/database").then(({ get }) =>
          get(ref(db, "users")),
        );
        if (cancelled) return;
        // `get` returns a snapshot
        const data = (snap.val?.() ?? {}) as Record<string, UserProfile>;
        setAllUsers(data);
      } catch {
        if (cancelled) return;
        setAllUsers({});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOwner, user]);

  const memberProfiles = useMemo(
    () =>
      memberUids.map((uid) => ({
        uid,
        profile: allUsers[uid],
      })),
    [allUsers, memberUids],
  );

  const suggestions = useMemo(() => {
    if (!isOwner) return [] as Array<{ uid: string; profile: UserProfile }>;
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const selected = new Set(memberUids);

    return Object.entries(allUsers)
      .filter(([uid, profile]) => {
        if (uid === user?.uid) return false;
        if (selected.has(uid)) return false;
        if (profile?.type !== 1) return false;
        const name = String(profile?.name ?? "").toLowerCase();
        const email = String(profile?.email ?? "").toLowerCase();
        const num = String(profile?.number ?? "").toLowerCase();
        return (
          name.includes(q) ||
          email.includes(q) ||
          num.includes(q)
        );
      })
      .slice(0, 10)
      .map(([uid, profile]) => ({ uid, profile }));
  }, [allUsers, isOwner, memberUids, search, user?.uid]);

  const balances = useMemo(
    () =>
      Object.entries(wallet?.currancies ?? {})
        .filter(([k, v]) => k && Number.isFinite(Number(v)))
        .sort(([a], [b]) => a.localeCompare(b)),
    [wallet?.currancies],
  );

  const handleSaveMeta = async () => {
    if (!user || !wallet || !Number.isFinite(walletId)) return;
    if (!isOwner) {
      Alert.alert(t("error"), t("onlyOwnerCanEdit") ?? "Only the owner can edit.");
      return;
    }

    try {
      const walletKey = `wallet${walletId}`;
      const updates: Record<string, unknown> = {
        [`wallets/${walletKey}/goal`]: goal.trim() || null,
      };
      await update(ref(db), updates);
      Alert.alert(t("saved"), t("changesSaved") ?? "Changes saved.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      Alert.alert(t("error"), msg);
    }
  };

  const handleAddMember = async (uid: string) => {
    if (!user || !wallet || !Number.isFinite(walletId)) return;
    if (!isOwner) return;

    const walletKey = `wallet${walletId}`;
    const updates: Record<string, unknown> = {
      [`wallets/${walletKey}/members/${uid}`]: true,
    };

    try {
      // also link wallet under user profile if not yet linked
      const { get } = await import("firebase/database");
      const snap = await get(ref(db, `users/${uid}/userwallet`));
      const userWallets = (snap.val() ?? {}) as Record<
        string,
        { walletid?: number }
      >;
      const alreadyLinked = Object.values(userWallets).some(
        (w) => Number(w?.walletid) === walletId,
      );
      if (!alreadyLinked) {
        const nextKey = getNextUserWalletKey(userWallets);
        updates[`users/${uid}/userwallet/${nextKey}`] = {
          name: name.trim() || `Wallet ${walletId}`,
          walletid: walletId,
        };
      }

      await update(ref(db), updates);
      setMemberUids((prev) =>
        prev.includes(uid) ? prev : [...prev, uid],
      );
      setSearch("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      Alert.alert(t("error"), msg);
    }
  };

  const handleRemoveMember = async (uid: string) => {
    if (!user || !wallet || !Number.isFinite(walletId)) return;
    if (!isOwner) return;
    if (uid === wallet.ownerUid) return;

    const walletKey = `wallet${walletId}`;
    const updates: Record<string, unknown> = {
      [`wallets/${walletKey}/members/${uid}`]: null,
    };

    try {
      const { get } = await import("firebase/database");
      const snap = await get(ref(db, `users/${uid}/userwallet`));
      const userWallets = (snap.val() ?? {}) as Record<
        string,
        { walletid?: number }
      >;
      for (const [slotKey, link] of Object.entries(userWallets)) {
        if (Number(link?.walletid) === walletId) {
          updates[`users/${uid}/userwallet/${slotKey}`] = null;
        }
      }

      await update(ref(db), updates);
      setMemberUids((prev) => prev.filter((x) => x !== uid));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      Alert.alert(t("error"), msg);
    }
  };

  const openAmountModal = (isAdd: boolean, currency?: string) => {
    setAmountIsAdd(isAdd);
    setAmount("");
    setAmountReason("");
    setAmountCurrency(currency ?? (balances[0]?.[0] ?? null));
    setAmountModalVisible(true);
  };

  const handleSaveAmount = async () => {
    if (!user || !wallet || !Number.isFinite(walletId)) return;
    if (!amountCurrency) return;

    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert(t("error"), t("invalidAmount") ?? "Enter a valid amount.");
      return;
    }

    const delta = amountIsAdd ? value : -value;
    const walletKey = `wallet${walletId}`;

    setSavingAmount(true);
    try {
      const { get } = await import("firebase/database");
      const snap = await get(ref(db, `wallets/${walletKey}/currancies`));
      const curr = (snap.val() ?? {}) as Record<string, number>;
      const key = amountCurrency.toLowerCase();
      const current = Number(curr[key] ?? 0);
      const next = current + delta;
      if (next < 0) {
        Alert.alert(
          t("error"),
          t("insufficientFunds") ?? "Not enough balance in this currency.",
        );
        setSavingAmount(false);
        return;
      }

      const updates: Record<string, unknown> = {
        [`wallets/${walletKey}/currancies/${key}`]: next,
      };

      const logsRef = ref(db, `wallets/${walletKey}/sharedLogs`);
      const logRef = push(logsRef);
      updates[`wallets/${walletKey}/sharedLogs/${logRef.key}`] = {
        userUid: user.uid,
        amount: delta,
        currency: key,
        reason: amountReason.trim() || (amountIsAdd ? "Add money" : "Spend"),
        createdAt: Date.now(),
      };

      await update(ref(db), updates);
      setAmountModalVisible(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      Alert.alert(t("error"), msg);
    } finally {
      setSavingAmount(false);
    }
  };

  if (!user) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t("pleaseSignIn")}</ThemedText>
      </ThemedView>
    );
  }

  if (!Number.isFinite(walletId)) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">
          {t("walletNotFound") ?? "Wallet not found"}
        </ThemedText>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </ThemedView>
    );
  }

  if (!wallet || String(wallet.type ?? "") !== "shared") {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">
          {t("walletNotFound") ?? "Wallet not found"}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="subtitle" style={styles.heading}>
          {t("sharedWallet") ?? "Shared wallet"}
        </ThemedText>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t("walletName") ?? "Wallet name"}
          </ThemedText>
          <ThemedText type="defaultSemiBold">
            {name.trim() || `Wallet ${walletId}`}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t("walletGoal") ?? "Goal for this wallet"}
          </ThemedText>
          <AuthInput
            value={goal}
            onChangeText={setGoal}
            placeholder={t("walletGoalPlaceholder") ?? "Save for a trip, rent..."}
          />
          {isOwner && (
            <GradientButton
              label="Save changes"
              onPress={handleSaveMeta}
              style={{ marginTop: 8 }}
            />
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t("members") ?? "Members"}
          </ThemedText>

          {memberProfiles.length === 0 ? (
            <ThemedText style={{ opacity: 0.6 }}>No members yet.</ThemedText>
          ) : (
            <View style={styles.membersList}>
              {memberProfiles.map(({ uid, profile }) => (
                <View key={uid} style={styles.memberRow}>
                  <View>
                    <ThemedText type="defaultSemiBold">
                      {profile?.name ?? uid}
                    </ThemedText>
                    <ThemedText style={styles.memberSub}>
                      {profile?.email ?? profile?.number ?? ""}
                    </ThemedText>
                  </View>
                  {uid === wallet.ownerUid ? (
                    <ThemedText style={styles.ownerPill}>Owner</ThemedText>
                  ) : isOwner ? (
                    <Pressable
                      onPress={() => handleRemoveMember(uid)}
                      style={({ pressed }) => [
                        styles.removeButton,
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <MaterialIcons
                        name="person-remove"
                        size={18}
                        color="#DC2626"
                      />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {isOwner && (
            <View style={{ marginTop: 12 }}>
              <AuthInput
                value={search}
                onChangeText={setSearch}
                placeholder={
                  t("searchByNameOrNumber") ??
                  "Search by name, phone or email"
                }
              />

              {suggestions.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {suggestions.map(({ uid, profile }) => (
                    <Pressable
                      key={uid}
                      onPress={() => handleAddMember(uid)}
                      style={({ pressed }) => [
                        styles.suggestionRow,
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <ThemedText type="defaultSemiBold" numberOfLines={1}>
                          {profile?.name ?? "Unnamed"}
                        </ThemedText>
                        <ThemedText style={styles.suggestionSub} numberOfLines={1}>
                          {profile?.email ?? profile?.number ?? uid}
                        </ThemedText>
                      </View>
                      <MaterialIcons name="person-add" size={20} color="#7C3AED" />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t("walletBalances") ?? "Balances"}
          </ThemedText>

          {balances.length === 0 ? (
            <ThemedText style={{ opacity: 0.6 }}>
              {t("noBalance") ?? "No balance yet."}
            </ThemedText>
          ) : (
            <View style={styles.balancesList}>
              {balances.map(([code, value]) => (
                <View key={code} style={styles.balanceRow}>
                  <ThemedText type="defaultSemiBold">
                    {formatCurrency(code)}
                  </ThemedText>
                  <ThemedText>{value}</ThemedText>
                  <View style={styles.balanceActions}>
                    <TouchableOpacity
                      onPress={() => openAmountModal(true, code)}
                      style={[styles.actionChip, styles.addChip]}
                    >
                      <Text style={styles.actionChipText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => openAmountModal(false, code)}
                      style={[styles.actionChip, styles.spendChip]}
                    >
                      <Text style={styles.actionChipText}>-</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t("history") ?? "History"}
          </ThemedText>

          {logsLoading ? (
            <View style={styles.center}>
              <ActivityIndicator />
            </View>
          ) : logs.length === 0 ? (
            <ThemedText style={{ opacity: 0.6 }}>
              {t("noHistory") ?? "No activity yet."}
            </ThemedText>
          ) : (
            <FlatList
              data={logs}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const date = new Date(item.createdAt);
                const isPositive = item.amount >= 0;
                return (
                  <View style={styles.logRow}>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="defaultSemiBold">
                        {item.reason || (isPositive ? "Add money" : "Spend")}
                      </ThemedText>
                      <ThemedText style={styles.logSub}>
                        {`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}
                      </ThemedText>
                    </View>
                    <ThemedText
                      type="defaultSemiBold"
                      style={[
                        styles.logAmount,
                        isPositive ? styles.logAmountPositive : styles.logAmountNegative,
                      ]}
                    >
                      {isPositive ? "+" : ""}
                      {item.amount.toFixed(2)} {formatCurrency(item.currency)}
                    </ThemedText>
                  </View>
                );
              }}
            />
          )}
        </View>
      </ScrollView>

      <Modal
        visible={amountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAmountModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAmountModalVisible(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
              {amountIsAdd
                ? t("addMoney") ?? "Add money"
                : t("spendMoney") ?? "Spend money"}
            </ThemedText>
            <ThemedText style={styles.sectionTitle}>
              {t("amount") ?? "Amount"}
            </ThemedText>
            <AuthInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
            />
            <ThemedText style={[styles.sectionTitle, { marginTop: 10 }]}>
              {t("currency") ?? "Currency"}
            </ThemedText>
            <View style={styles.currencyChipsRow}>
              {["nis", "usd", "jod", "eur", "gbp"].map((code) => {
                const selectedCode =
                  formatCurrency(amountCurrency ?? balances[0]?.[0] ?? "nis");
                const isSelected = selectedCode === formatCurrency(code);
                return (
                  <Pressable
                    key={code}
                    onPress={() => setAmountCurrency(code)}
                    style={({ pressed }) => [
                      styles.currencyChip,
                      isSelected ? styles.currencyChipSelected : null,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <ThemedText
                      type="defaultSemiBold"
                      style={[
                        styles.currencyChipText,
                        isSelected ? styles.currencyChipTextSelected : null,
                      ]}
                    >
                      {formatCurrency(code)}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <ThemedText style={[styles.sectionTitle, { marginTop: 10 }]}>
              {t("noteOptional") ?? "Note (optional)"}
            </ThemedText>
            <TextInput
              value={amountReason}
              onChangeText={setAmountReason}
              placeholder={t("reasonPlaceholder") ?? "Why?"}
              style={styles.noteInput}
              multiline
            />

            <GradientButton
              label={
                savingAmount
                  ? t("saving") ?? "Saving..."
                  : t("confirm") ?? "Confirm"
              }
              onPress={handleSaveAmount}
              disabled={savingAmount}
              loading={savingAmount}
              style={{ marginTop: 16 }}
            />

            <Pressable
              onPress={() => setAmountModalVisible(false)}
              style={({ pressed }) => [
                styles.cancel,
                pressed ? styles.pressed : null,
              ]}
            >
              <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                {t("cancel") ?? "Cancel"}
              </ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  content: {
    paddingBottom: 32,
    gap: 14,
  },
  heading: {
    fontFamily: Fonts.sansBlack,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    opacity: 0.65,
    fontFamily: Fonts.sansBold,
  },
  center: {
    paddingVertical: 32,
    alignItems: "center",
  },
  membersList: {
    gap: 10,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  memberSub: {
    opacity: 0.65,
    marginTop: 2,
  },
  ownerPill: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(16,185,129,0.12)",
    color: "#059669",
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.3)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(248,250,252,1)",
  },
  suggestionsBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
    overflow: "hidden",
    marginTop: 8,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(17,24,28,0.02)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17,24,28,0.06)",
  },
  suggestionSub: {
    opacity: 0.6,
    marginTop: 2,
  },
  balancesList: {
    gap: 10,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  balanceActions: {
    flexDirection: "row",
    gap: 6,
  },
  actionChip: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  addChip: {
    backgroundColor: "rgba(22,163,74,0.1)",
  },
  spendChip: {
    backgroundColor: "rgba(220,38,38,0.1)",
  },
  actionChipText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17,24,28,0.06)",
  },
  logSub: {
    opacity: 0.65,
    marginTop: 2,
    fontSize: 12,
  },
  logAmount: {
    fontSize: 14,
  },
  logAmountPositive: {
    color: "#16A34A",
  },
  logAmountNegative: {
    color: "#DC2626",
  },
  currencyChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  currencyChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.12)",
    backgroundColor: "rgba(248,250,252,1)",
  },
  currencyChipSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "rgba(124,58,237,0.09)",
  },
  currencyChipText: {
    fontSize: 13,
    color: "#111827",
  },
  currencyChipTextSelected: {
    color: "#4C1D95",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
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
  noteInput: {
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.10)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
    textAlignVertical: "top",
  },
  cancel: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.10)",
    marginTop: 10,
  },
  cancelText: {
    color: "rgba(17,24,28,0.75)",
  },
  pressed: {
    opacity: 0.9,
  },
});

