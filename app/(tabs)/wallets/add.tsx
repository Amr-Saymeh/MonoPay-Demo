import React, { useEffect, useMemo, useState } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { get, ref, update } from "firebase/database";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthInput } from "@/components/ui/auth-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { SharedCard } from "@/src/features/shared/SharedCard";
import { db } from "@/src/firebaseConfig";
import { useAuth } from "@/src/providers/AuthProvider";

type WalletType = "real" | "credit" | "shared";

type WalletRecord = {
  id?: number;
};

type UserWalletLink = {
  walletid?: number;
  id?: number;
};

type BalanceRow = {
  id: string;
  currency: string;
  amount: string;
};

type UserProfile = {
  name?: string;
  number?: string | number;
  type?: number;
};

const TYPE_OPTIONS: Array<{ key: WalletType; icon: any }> = [
  { key: "real", icon: "account-balance-wallet" },
  { key: "credit", icon: "credit-card" },
  { key: "shared", icon: "groups" },
];

const EMOJI_OPTIONS = [
  "💳",
  "🧾",
  "🏦",
  "👛",
  "💰",
  "⭐",
  "🔥",
  "🫶",
];

const CURRENCY_OPTIONS = ["nis", "usd", "jod", "eur", "gbp"];

function nextCurrency(current: string) {
  const idx = CURRENCY_OPTIONS.indexOf(current);
  if (idx === -1) return CURRENCY_OPTIONS[0];
  return CURRENCY_OPTIONS[(idx + 1) % CURRENCY_OPTIONS.length];
}

function isValidExpiry(value: string) {
  const v = value.trim();
  if (v.length === 0) return true;
  return /^(0[1-9]|1[0-2])\/(\d{2})$/.test(v);
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

function parseAmount(input: string) {
  const n = Number(input);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function getDefaultColor(type: WalletType) {
  if (type === "credit") return "#F97316";
  if (type === "shared") return "#0EA5E9";
  return "#7C3AED";
}

export default function AddWalletScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("real");
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [balances, setBalances] = useState<BalanceRow[]>([
    { id: "0", currency: "nis", amount: "" },
  ]);
  const [sharedSearch, setSharedSearch] = useState("");
  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>({});
  const [selectedMemberUids, setSelectedMemberUids] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const color = useMemo(() => getDefaultColor(type), [type]);

  const previewCurrencies = useMemo(
    () =>
      balances.reduce<Array<{ code: string; balance: number }>>((acc, row) => {
        const code = row.currency.trim().toLowerCase();
        const balance = Number(row.amount.trim() || 0);
        if (!code || acc.some((item) => item.code === code)) return acc;
        acc.push({ code, balance: Number.isFinite(balance) ? balance : 0 });
        return acc;
      }, []),
    [balances],
  );

  const previewMemberUids = useMemo(() => {
    if (type !== "shared" || !user) return undefined;
    return Array.from(new Set([user.uid, ...selectedMemberUids.filter(Boolean)]));
  }, [selectedMemberUids, type, user]);

  const previewOwnerLabel = useMemo(() => {
    if (type !== "shared" || !user) return undefined;
    return allUsers[user.uid]?.name?.trim() || user.uid;
  }, [allUsers, type, user]);

  const canCreate = useMemo(() => {
    return name.trim().length > 0 && Boolean(user);
  }, [name, user]);

  useEffect(() => {
    if (!user) return;
    if (type !== "shared") return;

    let cancelled = false;
    (async () => {
      try {
        const snap = await get(ref(db, "users"));
        if (cancelled) return;
        setAllUsers((snap.val() ?? {}) as Record<string, UserProfile>);
      } catch {
        if (cancelled) return;
        setAllUsers({});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [type, user]);

  useEffect(() => {
    if (type !== "shared") {
      setSharedSearch("");
      setSelectedMemberUids([]);
    }
  }, [type]);

  const sharedSuggestions = useMemo(() => {
    if (!user) return [] as Array<{ uid: string; profile: UserProfile }>;
    const q = sharedSearch.trim().toLowerCase();
    if (q.length === 0) return [] as Array<{ uid: string; profile: UserProfile }>;

    const selected = new Set(selectedMemberUids);

    return Object.entries(allUsers)
      .filter(([uid, profile]) => {
        if (uid === user.uid) return false;
        if (selected.has(uid)) return false;
        if (profile?.type !== 1) return false;
        const name = String(profile?.name ?? "").toLowerCase();
        const num = String(profile?.number ?? "").toLowerCase();
        return name.includes(q) || num.includes(q);
      })
      .slice(0, 8)
      .map(([uid, profile]) => ({ uid, profile }));
  }, [allUsers, sharedSearch, selectedMemberUids, user]);

  const createWallet = async () => {
    if (!user) return;

    const walletName = name.trim();
    if (walletName.length === 0) {
      Alert.alert(t("error"), t("walletNameRequired"));
      return;
    }

    if (type === "credit" && !isValidExpiry(expiryDate)) {
      Alert.alert(t("error"), t("invalidExpiry"));
      return;
    }

    const currancies: Record<string, number> = {};
    for (const row of balances) {
      const code = row.currency.trim().toLowerCase();
      const raw = row.amount.trim();
      if (raw.length === 0) continue;
      const value = parseAmount(raw);
      if (value === null) {
        Alert.alert(t("error"), t("invalidAmount"));
        return;
      }
      if (!code) continue;
      if (currancies[code] !== undefined) {
        Alert.alert(t("error"), `${t("duplicateCurrency")}: ${code.toUpperCase()}`);
        return;
      }
      currancies[code] = value;
    }

    setSaving(true);
    try {
      const walletsSnap = await get(ref(db, "wallets"));
      const wallets = (walletsSnap.val() ?? {}) as Record<string, WalletRecord>;

      const maxId = Object.values(wallets).reduce((acc, w) => {
        const value = Number(w?.id);
        return Number.isFinite(value) ? Math.max(acc, value) : acc;
      }, 0);

      const newWalletId = maxId + 1;
      const walletKey = `wallet${newWalletId}`;

      const userWalletsSnap = await get(ref(db, `users/${user.uid}/userwallet`));
      const userWallets = (userWalletsSnap.val() ?? {}) as Record<string, UserWalletLink>;

      const maxUserWalletIndex = Object.keys(userWallets).reduce((acc, key) => {
        const match = /^wallet(\d+)$/.exec(key);
        if (!match) return acc;
        const idx = Number(match[1]);
        return Number.isFinite(idx) ? Math.max(acc, idx) : acc;
      }, 0);

      const userWalletKey = `wallet${Math.max(1, maxUserWalletIndex + 1)}`;

      const sharedMembers =
        type === "shared"
          ? Array.from(new Set([user.uid, ...selectedMemberUids.filter(Boolean)]))
          : [];

      const sharedMembersMap =
        type === "shared"
          ? sharedMembers.reduce((acc, uid) => {
              acc[uid] = true;
              return acc;
            }, {} as Record<string, true>)
          : undefined;

      const updates: Record<string, unknown> = {
        [`wallets/${walletKey}`]: {
          currancies,
          id: newWalletId,
          state: "active",
          type,
          ...(type === "credit" ? { expiryDate: expiryDate.trim() || undefined } : {}),
          ...(type === "shared"
            ? { ownerUid: user.uid, members: sharedMembersMap }
            : {}),
        },
        [`users/${user.uid}/userwallet/${userWalletKey}`]: {
          name: walletName,
          walletid: newWalletId,
          color,
          emoji,
        },
      };

      if (type === "shared") {
        for (const uid of sharedMembers) {
          if (uid === user.uid) continue;

          const memberWalletsSnap = await get(ref(db, `users/${uid}/userwallet`));
          const memberWallets = (memberWalletsSnap.val() ?? {}) as Record<string, unknown>;
          const alreadyLinked = Object.values(memberWallets).some(
            (w: any) => Number(w?.walletid) === newWalletId,
          );

          if (!alreadyLinked) {
            const nextKey = getNextUserWalletKey(memberWallets);
            updates[`users/${uid}/userwallet/${nextKey}`] = {
              name: walletName,
              walletid: newWalletId,
              color,
              emoji,
            };
          }
        }
      }

      await update(ref(db), updates);
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      Alert.alert(t("error"), msg);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t("pleaseSignIn")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText type="subtitle" style={styles.heading}>
          {t("addWallet")}
        </ThemedText>

        <View style={styles.previewWrapper}>
          <SharedCard
            name={name.trim() || t("walletName")}
            emoji={emoji}
            currencies={previewCurrencies}
            ownerLabel={previewOwnerLabel}
            memberUids={previewMemberUids}
            walletState="active"
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("walletName")}</ThemedText>
          <AuthInput
            value={name}
            onChangeText={setName}
            placeholder={t("walletNamePlaceholder")}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("walletType")}</ThemedText>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map((opt) => {
              const selected = opt.key === type;
              const label =
                opt.key === "real"
                  ? t("walletTypeReal")
                  : opt.key === "credit"
                    ? t("walletTypeCredit")
                    : t("walletTypeShared");
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setType(opt.key)}
                  style={({ pressed }) => [
                    styles.typeCard,
                    selected ? styles.typeCardSelected : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <MaterialIcons
                    name={opt.icon}
                    size={22}
                    color={selected ? "#7C3AED" : "rgba(17,24,28,0.55)"}
                  />
                  <ThemedText type="defaultSemiBold">{label}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {type === "credit" ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t("walletExpiry")} (MM/YY)</ThemedText>
            <AuthInput
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="12/30"
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </View>
        ) : null}

        {type === "shared" ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t("addMembers")}</ThemedText>

            <AuthInput
              value={sharedSearch}
              onChangeText={setSharedSearch}
              placeholder={t("searchByNameOrNumber")}
              autoCapitalize="none"
            />

            {selectedMemberUids.length > 0 ? (
              <View style={styles.selectedMembersWrap}>
                {selectedMemberUids.map((uid) => (
                  <Pressable
                    key={uid}
                    onPress={() =>
                      setSelectedMemberUids((prev) => prev.filter((x) => x !== uid))
                    }
                    style={({ pressed }) => [
                      styles.memberChip,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <ThemedText type="defaultSemiBold" style={styles.memberChipText}>
                      {allUsers[uid]?.name ?? uid}
                    </ThemedText>
                    <MaterialIcons name="close" size={14} color="rgba(17,24,28,0.6)" />
                  </Pressable>
                ))}
              </View>
            ) : null}

            {sharedSuggestions.length > 0 ? (
              <View style={styles.suggestionsBox}>
                {sharedSuggestions.map(({ uid, profile }) => (
                  <Pressable
                    key={uid}
                    onPress={() => {
                      setSelectedMemberUids((prev) => [...prev, uid]);
                      setSharedSearch("");
                    }}
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
                        {profile?.number ?? uid}
                      </ThemedText>
                    </View>
                    <MaterialIcons name="add" size={18} color="#7C3AED" />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>{t("initialBalances")}</ThemedText>
            <Pressable
              onPress={() =>
                setBalances((prev) => [
                  ...prev,
                  {
                    id: String(Date.now()),
                    currency: "usd",
                    amount: "",
                  },
                ])
              }
              style={({ pressed }) => [styles.addCurrencyButton, pressed ? styles.pressed : null]}
            >
              <MaterialIcons name="add" size={18} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.balancesList}>
            {balances.map((row) => (
              <View key={row.id} style={styles.balanceRow}>
                <Pressable
                  onPress={() =>
                    setBalances((prev) =>
                      prev.map((r) =>
                        r.id === row.id
                          ? { ...r, currency: nextCurrency(r.currency) }
                          : r,
                      ),
                    )
                  }
                  style={({ pressed }) => [
                    styles.currencyPill,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <ThemedText type="defaultSemiBold" style={styles.currencyText}>
                    {row.currency.toUpperCase()}
                  </ThemedText>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <AuthInput
                    value={row.amount}
                    onChangeText={(text) =>
                      setBalances((prev) =>
                        prev.map((r) => (r.id === row.id ? { ...r, amount: text } : r)),
                      )
                    }
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("chooseEmoji")}</ThemedText>
          <View style={styles.emojiRow}>
            {EMOJI_OPTIONS.map((e) => {
              const selected = e === emoji;
              return (
                <Pressable
                  key={e}
                  onPress={() => setEmoji(e)}
                  style={({ pressed }) => [
                    styles.emojiButton,
                    selected ? styles.emojiSelected : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <ThemedText style={styles.emojiText}>{e}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <GradientButton
          label={saving ? t("creating") : t("createWallet")}
          onPress={createWallet}
          disabled={!canCreate}
          loading={saving}
          style={{ marginTop: 10 }}
        />

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cancel, pressed ? styles.pressed : null]}
        >
          <ThemedText type="defaultSemiBold" style={styles.cancelText}>
            {t("cancel")}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
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
  previewWrapper: {
    borderRadius: 24,
  },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    opacity: 0.65,
    fontFamily: Fonts.sansBold,
  },
  selectedMembersWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,28,0.06)",
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
  },
  memberChipText: {
    color: "rgba(17,24,28,0.78)",
  },
  suggestionsBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(17,24,28,0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17,24,28,0.08)",
  },
  suggestionSub: {
    opacity: 0.6,
    marginTop: 2,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeCard: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
    backgroundColor: "rgba(17,24,28,0.03)",
  },
  typeCardSelected: {
    borderColor: "rgba(124,58,237,0.55)",
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balancesList: {
    gap: 10,
  },
  addCurrencyButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  currencyPill: {
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(17,24,28,0.06)",
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  currencyText: {
    color: "#11181C",
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17,24,28,0.06)",
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
  },
  emojiSelected: {
    borderColor: "rgba(124,58,237,0.55)",
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  emojiText: {
    fontSize: 18,
  },
  cancel: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.10)",
    marginTop: 8,
  },
  cancelText: {
    color: "rgba(17,24,28,0.75)",
  },
  pressed: {
    opacity: 0.9,
  },
});
