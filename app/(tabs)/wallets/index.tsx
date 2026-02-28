import React, { useCallback, useEffect, useMemo, useState } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { get, onValue, ref, update } from "firebase/database";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { db } from "@/src/firebaseConfig";
import { useAuth } from "@/src/providers/AuthProvider";

type WalletRecord = {
  currancies?: Record<string, number>;
  id?: number;
  state?: string;
  expiryDate?: string;
  ownerUid?: string;
  members?: Record<string, true>;
  type?: "real" | "credit" | "shared" | string;
};

type UserWalletLink = {
  name?: string;
  walletid?: number;
  color?: string;
  emoji?: string;
};

type WalletCard = {
  userWalletKey: string;
  walletid: number;
  name: string;
  color: string;
  emoji: string;
  wallet?: WalletRecord;
};

function getDefaultColor(type: string | undefined) {
  if (type === "credit") return "#F97316";
  if (type === "shared") return "#0EA5E9";
  return "#7C3AED";
}

function formatCurrency(code: string) {
  return code.trim().toUpperCase();
}

function getBalances(currancies: Record<string, number> | undefined) {
  return Object.entries(currancies ?? {})
    .filter(([k, v]) => k && Number.isFinite(Number(v)))
    .sort(([a], [b]) => a.localeCompare(b));
}

const WalletCardItem = React.memo(function WalletCardItem({
  card,
  selected,
  onSelect,
}: {
  card: WalletCard;
  selected: boolean;
  onSelect: (key: string) => void;
}) {
  const { t } = useI18n();
  const state = (card.wallet?.state ?? "active").toLowerCase();
  const type = (card.wallet?.type ?? "real").toString();
  const balances = getBalances(card.wallet?.currancies);
  const membersCount =
    type === "shared" ? Object.keys(card.wallet?.members ?? {}).length : 0;
  const infoText =
    type === "shared"
      ? `${membersCount} ${t("members")}`
      : type === "credit" && card.wallet?.expiryDate
        ? `${t("expShort")} ${card.wallet.expiryDate}`
        : "";

  return (
    <Pressable
      onPress={() => onSelect(card.userWalletKey)}
      style={({ pressed }) => [styles.cardWrap, pressed ? styles.pressed : null]}
    >
      <LinearGradient
        colors={[card.color, "#111827"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, selected ? styles.cardSelected : null]}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardTitleRow}>
            <ThemedText style={styles.cardEmoji}>{card.emoji}</ThemedText>
            <ThemedText style={styles.cardTitle} numberOfLines={1}>
              {card.name}
            </ThemedText>
          </View>

          <View style={styles.cardTopRight}>
            <View style={styles.cardTopRightRow}>
              <MaterialIcons
                name={
                  type === "credit"
                    ? "credit-card"
                    : type === "shared"
                      ? "groups"
                      : "account-balance-wallet"
                }
                size={18}
                color="rgba(255,255,255,0.85)"
              />
              <View
                style={[
                  styles.pill,
                  state === "active" ? styles.pillActive : styles.pillInactive,
                ]}
              >
                <ThemedText style={styles.pillText}>
                  {state === "active" ? t("active") : t("inactive")}
                </ThemedText>
              </View>
            </View>

            {infoText.length > 0 ? (
              <ThemedText style={styles.cardInfoText} numberOfLines={1}>
                {infoText}
              </ThemedText>
            ) : null}

            <ThemedText style={styles.cardBalanceRightLabel}>
              {t("balance")}
            </ThemedText>
          </View>
        </View>

        <View style={styles.cardBody}>
          {balances.length === 0 ? (
            <ThemedText style={styles.cardValue}>—</ThemedText>
          ) : (
            <View style={styles.balancesColumn}>
              {balances.map(([code, amount]) => (
                <View key={code} style={styles.balancePill}>
                  <ThemedText style={styles.balancePillText}>
                    {formatCurrency(code)} {amount}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
});

export default function WalletManagementScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [userWallets, setUserWallets] = useState<Record<string, UserWalletLink>>(
    {},
  );
  const [wallets, setWallets] = useState<Record<string, WalletRecord>>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsub = onValue(
      ref(db, `users/${user.uid}/userwallet`),
      (snap) => {
        setUserWallets((snap.val() ?? {}) as Record<string, UserWalletLink>);
        setLoading(false);
      },
      () => {
        setUserWallets({});
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user]);

  useEffect(() => {
    const walletIds = Array.from(
      new Set(
        Object.values(userWallets)
          .map((w) => Number(w?.walletid))
          .filter((id) => Number.isFinite(id) && id > 0) as number[],
      ),
    ).sort((a, b) => a - b);

    if (walletIds.length === 0) {
      setWallets({});
      return;
    }

    const unsubs = walletIds.map((id) => {
      const key = `wallet${id}`;
      return onValue(
        ref(db, `wallets/${key}`),
        (snap) => {
          const val = snap.val() as WalletRecord | null;
          setWallets((prev) => {
            const next = { ...prev };
            if (val) next[key] = val;
            else delete next[key];
            return next;
          });
        },
        () => {
          setWallets((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        },
      );
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [userWallets]);

  const cards = useMemo<WalletCard[]>(() => {
    const list = Object.entries(userWallets)
      .map(([userWalletKey, link]) => {
        const walletid = Number(link?.walletid);
        if (!Number.isFinite(walletid) || walletid <= 0) return null;

        const wallet = wallets[`wallet${walletid}`];
        const type = wallet?.type;

        return {
          userWalletKey,
          walletid,
          name: link?.name?.trim() || `Wallet ${walletid}`,
          emoji: link?.emoji?.trim() || "💳",
          color: link?.color?.trim() || getDefaultColor(type),
          wallet,
        };
      })
      .filter(Boolean) as WalletCard[];

    list.sort((a, b) => a.walletid - b.walletid);
    return list;
  }, [userWallets, wallets]);

  useEffect(() => {
    if (selectedKey) return;
    if (cards.length === 0) return;
    setSelectedKey(cards[0].userWalletKey);
  }, [cards, selectedKey]);

  const selected = useMemo(() => {
    if (!selectedKey) return null;
    return cards.find((c) => c.userWalletKey === selectedKey) ?? null;
  }, [cards, selectedKey]);

  const selectedTypeLabel = useMemo(() => {
    const type = String(selected?.wallet?.type ?? "").toLowerCase();
    if (type === "real") return t("walletTypeReal");
    if (type === "credit") return t("walletTypeCredit");
    if (type === "shared") return t("walletTypeShared");
    return String(selected?.wallet?.type ?? "—");
  }, [selected?.wallet?.type, t]);

  const selectedStatusLabel = useMemo(() => {
    const state = String(selected?.wallet?.state ?? "").toLowerCase();
    if (state === "active") return t("active");
    if (state === "inactive") return t("inactive");
    return String(selected?.wallet?.state ?? "—");
  }, [selected?.wallet?.state, t]);

  const mainWallet = useMemo(() => {
    const byKey = cards.find((c) => c.userWalletKey === "wallet1");
    if (byKey) return byKey;

    const byName = cards.find((c) => c.name.trim().toLowerCase() === "main wallet");
    if (byName) return byName;

    return cards[0] ?? null;
  }, [cards]);

  const deleteSelectedWallet = useCallback(async () => {
    if (!user) return;
    if (!selected) return;
    if (!mainWallet) {
      Alert.alert(t("error"), t("mainWalletNotFound"));
      return;
    }
    if (selected.walletid === mainWallet.walletid) {
      Alert.alert(t("error"), t("cannotDeleteMainWallet"));
      return;
    }

    setDeleting(true);
    try {
      const deleteWalletId = selected.walletid;
      const mainWalletId = mainWallet.walletid;

      const [mainSnap, walletSnap] = await Promise.all([
        get(ref(db, `wallets/wallet${mainWalletId}/currancies`)),
        get(ref(db, `wallets/wallet${deleteWalletId}`)),
      ]);

      const mainCurr = (mainSnap.val() ?? {}) as Record<string, number>;
      const walletRecord = (walletSnap.val() ?? null) as WalletRecord | null;
      const delCurr = (walletRecord?.currancies ?? {}) as Record<string, number>;

      if (!walletRecord) {
        Alert.alert(t("error"), t("walletNotFound"));
        return;
      }

      if (
        String(walletRecord.type ?? "") === "shared" &&
        walletRecord.ownerUid &&
        walletRecord.ownerUid !== user.uid
      ) {
        Alert.alert(t("error"), t("onlyOwnerCanDelete"));
        return;
      }

      const merged: Record<string, number> = { ...mainCurr };
      for (const [code, amount] of Object.entries(delCurr)) {
        const a = Number(amount);
        if (!Number.isFinite(a)) continue;
        const prev = Number(merged[code] ?? 0);
        merged[code] = (Number.isFinite(prev) ? prev : 0) + a;
      }

      const updates: Record<string, unknown> = {
        [`wallets/wallet${mainWalletId}/currancies`]: merged,
        [`wallets/wallet${deleteWalletId}`]: null,
      };

      for (const [key, link] of Object.entries(userWallets)) {
        if (Number(link?.walletid) === deleteWalletId) {
          updates[`users/${user.uid}/userwallet/${key}`] = null;
        }
      }

      const memberUids = Object.keys(walletRecord?.members ?? {});
      for (const uid of memberUids) {
        if (!uid || uid === user.uid) continue;
        const snap = await get(ref(db, `users/${uid}/userwallet`));
        const memberWallets = (snap.val() ?? {}) as Record<string, UserWalletLink>;
        for (const [key, link] of Object.entries(memberWallets)) {
          if (Number(link?.walletid) === deleteWalletId) {
            updates[`users/${uid}/userwallet/${key}`] = null;
          }
        }
      }

      await update(ref(db), updates);
      setSelectedKey(mainWallet.userWalletKey);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      Alert.alert(t("error"), msg);
    } finally {
      setDeleting(false);
    }
  }, [mainWallet, selected, t, user, userWallets]);

  const confirmDelete = useCallback(() => {
    if (!selected) return;
    Alert.alert(t("deleteWalletConfirmTitle"), `${t("deleteWalletConfirmMessage")} "${selected.name}"?`, [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => {
          void deleteSelectedWallet();
        },
      },
    ]);
  }, [deleteSelectedWallet, selected, t]);

  const onSelect = useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  if (!user) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText type="subtitle">{t("pleaseSignIn")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <ThemedText type="subtitle" style={styles.title}>
            {t("walletManagement")}
          </ThemedText>
          <ThemedText style={styles.subtitle}>{t("yourWallets")}</ThemedText>
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/wallets/add" as any)}
          style={({ pressed }) => [
            styles.addButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <MaterialIcons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : cards.length === 0 ? (
        <ThemedView style={styles.empty}>
          <ThemedText type="subtitle">{t("noWalletsYet")}</ThemedText>
          <ThemedText style={styles.emptyText}>
            {t("tapPlusToAddFirstWallet")}
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          <View style={styles.content}>
            <View style={styles.cardsContainer}>
              <FlatList
                horizontal
                data={cards}
                extraData={selectedKey}
                keyExtractor={(item) => item.userWalletKey}
                showsHorizontalScrollIndicator={false}
                disableVirtualization
                contentContainerStyle={styles.cardsRow}
                ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
                renderItem={({ item }) => (
                  <WalletCardItem
                    card={item}
                    selected={selectedKey === item.userWalletKey}
                    onSelect={onSelect}
                  />
                )}
              />
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              <ThemedView style={styles.detailsCard}>
                <ThemedText style={styles.sectionTitle}>{t("walletDetails")}</ThemedText>

                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>{t("walletName")}</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                    {selected?.name ?? "—"}
                  </ThemedText>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>{t("walletType")}</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                    {selectedTypeLabel}
                  </ThemedText>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>{t("walletStatus")}</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                    {selectedStatusLabel}
                  </ThemedText>
                </View>

                {String(selected?.wallet?.type ?? "") === "credit" ? (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>{t("walletExpiry")}</ThemedText>
                      <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                        {selected?.wallet?.expiryDate ?? "—"}
                      </ThemedText>
                    </View>
                  </>
                ) : null}

                {String(selected?.wallet?.type ?? "") === "shared" ? (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>{t("walletOwner")}</ThemedText>
                      <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                        {selected?.wallet?.ownerUid ?? "—"}
                      </ThemedText>
                    </View>

                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>{t("walletMembers")}</ThemedText>
                      <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                        {Object.keys(selected?.wallet?.members ?? {}).length > 0
                          ? Object.keys(selected?.wallet?.members ?? {}).length
                          : "—"}
                      </ThemedText>
                    </View>
                  </>
                ) : null}

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>{t("walletCurrencies")}</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                    {Object.keys(selected?.wallet?.currancies ?? {}).length > 0
                      ? Object.entries(selected?.wallet?.currancies ?? {})
                          .map(([k, v]) => `${formatCurrency(k)}: ${v}`)
                          .join("  ")
                      : "—"}
                  </ThemedText>
                </View>

                <View style={styles.divider} />

                <Pressable
                  disabled={!selected || deleting}
                  onPress={confirmDelete}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    deleting ? styles.deleteButtonDisabled : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <MaterialIcons name="delete" size={18} color="#fff" />
                  <ThemedText type="defaultSemiBold" style={styles.deleteButtonText}>
                    {deleting ? t("deleting") : t("deleteWallet")}
                  </ThemedText>
                </Pressable>
              </ThemedView>
            </ScrollView>
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 14,
  },
  content: {
    flex: 1,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontFamily: Fonts.sansBlack,
  },
  subtitle: {
    opacity: 0.65,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    paddingVertical: 32,
    alignItems: "center",
  },
  empty: {
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
  },
  emptyText: {
    opacity: 0.7,
  },
  cardsRow: {
    paddingLeft: 2,
    paddingRight: 16,
  },
  cardsContainer: {
    height: 240,
  },
  cardSeparator: {
    width: 12,
  },
  cardWrap: {
    width: 290,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  card: {
    borderRadius: 22,
    padding: 16,
    height: 230,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: "rgba(255,255,255,0.65)",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  cardTopRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  cardTopRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardEmoji: {
    fontSize: 22,
    color: "#fff",
  },
  cardTitle: {
    fontSize: 16,
    color: "#fff",
    fontFamily: Fonts.sansBlack,
    flex: 1,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  pillActive: {
    backgroundColor: "rgba(34,197,94,0.18)",
  },
  pillInactive: {
    backgroundColor: "rgba(239,68,68,0.18)",
  },
  pillText: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
  },
  cardInfoText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  cardBalanceRightLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  cardBody: {
    marginTop: 6,
  },
  cardLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  cardValue: {
    fontSize: 20,
    color: "#fff",
    fontFamily: Fonts.sansBold,
    marginTop: 2,
  },
  balancesColumn: {
    flexDirection: "column",
    gap: 6,
    marginTop: 6,
  },
  balancePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignSelf: "flex-start",
  },
  balancePillText: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.95,
    fontFamily: Fonts.sansBold,
  },
  detailsCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(17,24,28,0.08)",
    backgroundColor: "rgba(17,24,28,0.03)",
  },
  sectionTitle: {
    opacity: 0.65,
    fontFamily: Fonts.sansBold,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  detailLabel: {
    opacity: 0.65,
    flex: 1,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(17,24,28,0.08)",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#dc2626",
  },
  deleteButtonDisabled: {
    backgroundColor: "rgba(220,38,38,0.55)",
  },
  deleteButtonText: {
    color: "#fff",
  },
  pressed: {
    opacity: 0.9,
  },
});
