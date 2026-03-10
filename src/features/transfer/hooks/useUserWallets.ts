import { useEffect, useState } from "react";

import { get, ref } from "firebase/database";

import { db } from "@/src/firebaseConfig";
import { Wallet } from "../types/index";

export interface EnrichedWalletSlot {
  slotKey: string;
  slotName: string;
  walletKey: string;
  walletId: number;
  color?: string;
  emoji?: string;
  wallet?: Wallet;
}

interface UseUserWalletsResult {
  wallets: EnrichedWalletSlot[];
  loading: boolean;
  error: string | null;
}

export function useUserWallets(userUid: string | null): UseUserWalletsResult {
  const [wallets, setWallets] = useState<EnrichedWalletSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userUid) {
      setWallets([]);
      return;
    }

    const fetchWallets = async () => {
      try {
        setLoading(true);
        setError(null);

        const userWalletSnap = await get(
          ref(db, `users/${userUid}/userwallet`),
        );
        if (!userWalletSnap.exists()) {
          setWallets([]);
          return;
        }

        const userWalletRaw = userWalletSnap.val() as Record<
          string,
          {
            name: string;
            walletid?: number;
            id?: number;
            color?: string;
            emoji?: string;
          }
        >;

        // Fetch actual wallet data for each slot
        const enriched = await Promise.all(
          Object.entries(userWalletRaw).map(async ([slotKey, slot]) => {
            const walletId = slot.walletid ?? slot.id;
            if (walletId === undefined) {
              return {
                slotKey,
                slotName: slot.name,
                walletKey: "",
                walletId: -1,
                color: slot.color,
                emoji: slot.emoji,
                wallet: undefined,
              } as EnrichedWalletSlot;
            }

            const walletKey = `wallet${walletId}`;
            const walletSnap = await get(ref(db, `wallets/${walletKey}`));
            const wallet: Wallet | undefined = walletSnap.exists()
              ? walletSnap.val()
              : undefined;

            return {
              slotKey,
              slotName: slot.name,
              walletKey,
              walletId,
              color: slot.color,
              emoji: slot.emoji,
              wallet,
            } as EnrichedWalletSlot;
          }),
        );

        // Only show active wallets
        setWallets(enriched.filter((w) => w.wallet?.state === "active"));
      } catch (e) {
        console.error("[useUserWallets]", e);
        setError("Failed to load wallets");
      } finally {
        setLoading(false);
      }
    };

    void fetchWallets();
  }, [userUid]);

  return { wallets, loading, error };
}
