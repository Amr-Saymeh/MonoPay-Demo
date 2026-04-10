import React, { useEffect, useMemo, useState } from "react";

import { ThemedView } from "@/components/themed-view";
import { SharedCard } from "@/src/features/card/SharedCard";

import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    View
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
    AmountModal,
    BalanceActions,
    HistorySection,
    MemberSection,
} from "@/src/features/shared/components";
import {
    useAllUsersProfiles,
    useAmountTransaction,
    useMemberSuggestions,
    useSharedWallet,
    useSharedWalletLogs,
} from "@/src/features/shared/hooks";
import {
    getNextUserWalletKey,
} from "@/src/features/shared/utils/walletHelpers";
import { db } from "@/src/firebaseConfig";
import { useAuth } from "@/src/providers/AuthProvider";
import { ref, update } from "firebase/database";

function formatAmount(value: number): string {
  return Number(value).toFixed(2);
}

function formatCurrency(code: string): string {
  return code.trim().toUpperCase();
}

export default function SharedWalletScreen() {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const { t } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ walletId?: string; walletid?: string }>();

  const walletIdParam = useMemo(
    () => params.walletId ?? params.walletid,
    [params.walletId, params.walletid],
  );

  const walletId = useMemo(() => Number(walletIdParam ?? NaN), [walletIdParam]);

  useEffect(() => {
    if (!user) return;
    if (!Number.isFinite(walletId)) {
      router.replace("/wallets" as any);
    }
  }, [router, user, walletId]);

  const { wallet, loading, name, memberUids } = useSharedWallet(user, walletId);
  const { logs, loading: logsLoading } = useSharedWalletLogs(user, walletId);
  const { allUsers } = useAllUsersProfiles(user);

  const [search, setSearch] = useState("");
  const isOwner = !!user && !!wallet?.ownerUid && wallet.ownerUid === user.uid;

  const { suggestions } = useMemberSuggestions(search, isOwner, allUsers, memberUids, user?.uid);

  const [amountModalVisible, setAmountModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [amountCurrency, setAmountCurrency] = useState<string | null>(null);
  const [amountReason, setAmountReason] = useState("");
  const [amountIsAdd, setAmountIsAdd] = useState(true);
  const [availableBalance, setAvailableBalance] = useState<number | undefined>(undefined);

  const onTransactionSuccess = () => {
    setAmountModalVisible(false);
    setAmount("");
    setAmountReason("");
    setAvailableBalance(undefined);
  };

  const { saving: savingAmount, execute, getAvailableBalance } = useAmountTransaction({
    user,
    walletId,
    t,
    onSuccess: onTransactionSuccess,
  });

  const memberProfiles = useMemo(
    () => memberUids.map((uid) => ({ uid, profile: allUsers[uid] })),
    [allUsers, memberUids]
  );

  const balances = useMemo(
    () =>
      Object.entries(wallet?.currancies ?? {})
        .filter(([k, v]) => k && Number.isFinite(Number(v)))
        .sort(([a], [b]) => a.localeCompare(b)),
    [wallet?.currancies]
  );

  const availableCurrencies = useMemo(() => {
    if (amountIsAdd) return ["USD", "EUR", "NIS", "JOD", "EGP"];
    return balances.map(([code]) => code.toUpperCase());
  }, [amountIsAdd, balances]);

  const ownerProfile = useMemo(
    () => (wallet?.ownerUid ? allUsers[wallet.ownerUid] : undefined),
    [allUsers, wallet?.ownerUid]
  );
  const walletState = String(wallet?.state ?? "active").toLowerCase();
  const ownerLabel = ownerProfile?.name?.trim() || ownerProfile?.email?.trim() || wallet?.ownerUid || "—";

  const cardCurrencies = useMemo(
    () =>
      Object.entries(wallet?.currancies ?? {})
        .map(([code, balance]) => ({ code: code.toUpperCase(), balance: Number(balance) }))
        .filter(({ balance }) => Number.isFinite(balance)),
    [wallet?.currancies]
  );

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
      setSearch("");
    } catch (e) {
      Alert.alert(t("error"), e instanceof Error ? e.message : "Failed");
    }
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
    } catch (e) {
      Alert.alert(t("error"), e instanceof Error ? e.message : "Failed");
    }
  };

  const openAmountModal = async (isAdd: boolean, currency?: string) => {
    setAmountIsAdd(isAdd);
    setAmount("");
    setAmountReason("");
    const defaultCur = isAdd ? "NIS" : (balances[0]?.[0] ?? null);
    const selectedCurrency = currency ?? defaultCur;
    setAmountCurrency(selectedCurrency);

    // Fetch available balance for remove operations
    if (!isAdd && selectedCurrency) {
      const balance = await getAvailableBalance(selectedCurrency);
      setAvailableBalance(balance);
    } else {
      setAvailableBalance(undefined);
    }

    setAmountModalVisible(true);
  };

  const executeSaveAmount = async () => {
    const result = await execute({
      amount,
      currency: amountCurrency,
      reason: amountReason,
      isAdd: amountIsAdd,
    });

    if (!result.success && result.error) {
      Alert.alert(t("error") ?? "Error", result.error);
    }
  };

  const handleSaveAmount = async () => {
    if (!user || !wallet || !Number.isFinite(walletId) || !amountCurrency) return;

    // Show confirmation dialog for remove operations
    if (!amountIsAdd && availableBalance !== undefined) {
      const value = Number(amount.replace(",", "."));
      if (!Number.isFinite(value) || value <= 0) {
        await executeSaveAmount();
        return;
      }

      const message = `${t("confirmRemove") ?? "Remove"} ${formatAmount(value)} ${formatCurrency(amountCurrency)}?

${t("availableBalance") ?? "Available"}: ${formatAmount(availableBalance)} ${formatCurrency(amountCurrency)}
${t("remainingBalance") ?? "After transaction"}: ${formatAmount(Math.max(0, availableBalance - value))} ${formatCurrency(amountCurrency)}`;

      Alert.alert(
        t("confirmRemoveTitle") ?? "Confirm Removal",
        message,
        [
          {
            text: t("cancel") ?? "Cancel",
            style: "cancel",
          },
          {
            text: t("remove") ?? "Remove",
            style: "destructive",
            onPress: executeSaveAmount,
          },
        ]
      );
      return;
    }

    await executeSaveAmount();
  };

  if (!user)
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t("pleaseSignIn")}</ThemedText>
      </ThemedView>
    );

  if (!Number.isFinite(walletId))
    return (
      <ThemedView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </ThemedView>
    );

  if (loading)
    return (
      <ThemedView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </ThemedView>
    );

  if (!wallet || String(wallet.type ?? "") !== "shared")
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t("walletNotFound") ?? "Wallet not found"}</ThemedText>
      </ThemedView>
    );

  return (
    <ThemedView style={styles.screen}>
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

        <MemberSection
          isOwner={isOwner}
          search={search}
          onSearchChange={setSearch}
          suggestions={suggestions}
          onAddMember={handleAddMember}
          memberProfiles={memberProfiles}
          ownerUid={wallet.ownerUid}
          onRemoveMember={handleRemoveMember}
        />

        <View style={[styles.sectionCard, { backgroundColor: surfaceColor, borderColor }]}>
          <BalanceActions
            onAddMoney={() => openAmountModal(true)}
            onRemoveMoney={() => openAmountModal(false)}
          />
        </View>

        <HistorySection logs={logs} loading={logsLoading} allUsers={allUsers} />
      </ScrollView>

      <AmountModal
        visible={amountModalVisible}
        onClose={() => !savingAmount && setAmountModalVisible(false)}
        isAdd={amountIsAdd}
        amount={amount}
        onAmountChange={setAmount}
        amountCurrency={amountCurrency}
        onCurrencyChange={async (currency) => {
          setAmountCurrency(currency);
          if (!amountIsAdd) {
            const balance = await getAvailableBalance(currency);
            setAvailableBalance(balance);
          }
        }}
        amountReason={amountReason}
        onReasonChange={setAmountReason}
        availableCurrencies={availableCurrencies}
        saving={savingAmount}
        onConfirm={handleSaveAmount}
        availableBalance={availableBalance}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 16, paddingHorizontal: 16 },
  center: { paddingVertical: 32, alignItems: "center" },
  content: { paddingBottom: 40, gap: 14 },
  cardWrapper: {
    borderRadius: 22,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
});
