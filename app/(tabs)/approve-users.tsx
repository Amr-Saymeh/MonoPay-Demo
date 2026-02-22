import React, { useEffect, useMemo, useState } from 'react';

import { Image } from 'expo-image';
import { get, onValue, ref, remove, update } from 'firebase/database';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { db } from '../../src/firebaseConfig';

type UserRecord = {
  address?: string;
  identityImage?: string;
  identityNumber?: number;
  name?: string;
  number?: number;
  personalImage?: string;
  type?: number;
};

type PendingUser = {
  id: string;
  data: UserRecord;
};

type WalletRecord = {
  id?: number;
};

function isValidImageUri(uri: unknown): uri is string {
  return typeof uri === 'string' && uri.trim().length > 0;
}

function ActionButton({
  label,
  variant,
  onPress,
  disabled,
}: {
  label: string;
  variant: 'approve' | 'reject';
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        variant === 'approve' ? styles.actionApprove : styles.actionReject,
        pressed ? styles.actionPressed : null,
        disabled ? styles.actionDisabled : null,
      ]}>
      <ThemedText type="defaultSemiBold" style={styles.actionLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function ApproveUsersScreen() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const usersRef = useMemo(() => ref(db, 'users'), []);

  useEffect(() => {
    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const data = (snapshot.val() ?? {}) as Record<string, UserRecord>;

        const list: PendingUser[] = Object.entries(data)
          .filter(([, value]) => Number(value?.type) === 0)
          .map(([id, value]) => ({ id, data: value }));

        setPendingUsers(list);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [usersRef]);

  const approveUser = async (userId: string) => {
    const walletsSnap = await get(ref(db, 'wallets'));
    const wallets = (walletsSnap.val() ?? {}) as Record<string, WalletRecord>;

    const userWalletsSnap = await get(ref(db, `users/${userId}/userwallet`));
    const userWallets = (userWalletsSnap.val() ?? {}) as Record<string, unknown>;

    const maxId = Object.values(wallets).reduce((acc, w) => {
      const value = Number(w?.id);
      return Number.isFinite(value) ? Math.max(acc, value) : acc;
    }, 0);

    const newWalletId = maxId + 1;

    const maxUserWalletIndex = Object.keys(userWallets).reduce((acc, key) => {
      const match = /^wallet(\d+)$/.exec(key);
      if (!match) return acc;
      const idx = Number(match[1]);
      return Number.isFinite(idx) ? Math.max(acc, idx) : acc;
    }, 0);

    const userWalletKey = `wallet${Math.max(1, maxUserWalletIndex + 1)}`;
    const walletKey = `wallet${newWalletId}`;

    const updates: Record<string, unknown> = {
      [`wallets/${walletKey}`]: {
        currancies: {},
        id: newWalletId,
        state: 'active',
        type: 'real',
      },
      [`users/${userId}/type`]: 1,
      [`users/${userId}/userwallet/${userWalletKey}`]: {
        name: 'Main wallet',
        walletid: newWalletId,
      },
    };

    await update(ref(db), updates);
  };

  const rejectUser = async (userId: string) => {
    await remove(ref(db, `users/${userId}`));
  };

  const onApprove = (userId: string, userName?: string) => {
    Alert.alert(
      'Approve user',
      `Approve ${userName ?? userId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              await approveUser(userId);
            } catch {
              Alert.alert('Error', 'Failed to approve user.');
            }
          },
        },
      ]
    );
  };

  const onReject = (userId: string, userName?: string) => {
    Alert.alert(
      'Reject user',
      `Reject ${userName ?? userId}? This will delete the user from the database.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectUser(userId);
            } catch {
              Alert.alert('Error', 'Failed to reject user.');
            }
          },
        },
      ]
    );
  };

  const pendingCount = pendingUsers.length;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E9F7FF', dark: '#11222A' }}
      headerImage={
        <IconSymbol size={260} color="#0a7ea4" name="person.crop.circle" style={styles.headerIcon} />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Approve Users
        </ThemedText>
        <View style={styles.countPill}>
          <ThemedText type="defaultSemiBold" style={styles.countPillText}>
            {pendingCount}
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedText style={styles.subtitle}>Pending verification</ThemedText>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : pendingUsers.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText type="subtitle">No pending users</ThemedText>
          <ThemedText style={styles.emptyText}>Users with type 0 will show up here.</ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.list}>
          {pendingUsers.map((item) => {
            const { id, data } = item;
            const isOpen = expandedUserId === id;

            return (
              <ThemedView key={id} style={styles.card}>
                <Pressable
                  onPress={() => setExpandedUserId((prev) => (prev === id ? null : id))}
                  style={({ pressed }) => [styles.cardHeader, pressed ? styles.headerPressed : null]}>
                  <View style={styles.headerLeft}>
                    {isValidImageUri(data.personalImage) ? (
                      <Image
                        source={{ uri: data.personalImage.trim() }}
                        style={styles.avatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder} />
                    )}
                    <View style={styles.headerText}>
                      <ThemedText type="subtitle" style={styles.userName}>
                        {data.name ?? id}
                      </ThemedText>
                      <ThemedText style={styles.userId}>@{id}</ThemedText>
                    </View>
                  </View>

                  <IconSymbol
                    size={18}
                    name="chevron.right"
                    color="#6b7280"
                    style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
                  />
                </Pressable>

                {isOpen ? (
                  <View style={styles.cardBody}>
                    <View style={styles.detailRow}>
                      <ThemedText type="defaultSemiBold">Phone</ThemedText>
                      <ThemedText>{data.number ?? '-'}</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <ThemedText type="defaultSemiBold">Address</ThemedText>
                      <ThemedText>{data.address ?? '-'}</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <ThemedText type="defaultSemiBold">Identity #</ThemedText>
                      <ThemedText>{data.identityNumber ?? '-'}</ThemedText>
                    </View>

                    <View style={styles.imagesRow}>
                      <View style={styles.imageBlock}>
                        <ThemedText type="defaultSemiBold" style={styles.imageLabel}>
                          Personal
                        </ThemedText>
                        {isValidImageUri(data.personalImage) ? (
                          <Image
                            source={{ uri: data.personalImage.trim() }}
                            style={styles.image}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.imagePlaceholder} />
                        )}
                      </View>

                      <View style={styles.imageBlock}>
                        <ThemedText type="defaultSemiBold" style={styles.imageLabel}>
                          Identity
                        </ThemedText>
                        {isValidImageUri(data.identityImage) ? (
                          <Image
                            source={{ uri: data.identityImage.trim() }}
                            style={styles.image}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.imagePlaceholder} />
                        )}
                      </View>
                    </View>

                    <View style={styles.actionsRow}>
                      <ActionButton
                        label="Approve"
                        variant="approve"
                        onPress={() => onApprove(id, data.name)}
                      />
                      <ActionButton
                        label="Reject"
                        variant="reject"
                        onPress={() => onReject(id, data.name)}
                      />
                    </View>
                  </View>
                ) : null}
              </ThemedView>
            );
          })}
        </View>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    bottom: -80,
    left: -20,
    position: 'absolute',
    opacity: 0.25,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countPill: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
  },
  countPillText: {
    color: '#fff',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  center: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyState: {
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  emptyText: {
    opacity: 0.7,
  },
  list: {
    gap: 12,
    paddingTop: 8,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.18)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerPressed: {
    opacity: 0.9,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(120,120,120,0.12)',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(120,120,120,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.18)',
  },
  cardBody: {
    padding: 16,
    paddingTop: 0,
    gap: 10,
  },
  userName: {
    fontFamily: Fonts.rounded,
  },
  userId: {
    opacity: 0.6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  imageBlock: {
    flex: 1,
    gap: 6,
  },
  imageLabel: {
    opacity: 0.75,
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    backgroundColor: 'rgba(120,120,120,0.12)',
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    backgroundColor: 'rgba(120,120,120,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.18)',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionLabel: {
    color: '#fff',
  },
  actionApprove: {
    backgroundColor: '#16a34a',
  },
  actionReject: {
    backgroundColor: '#dc2626',
  },
  actionPressed: {
    opacity: 0.88,
  },
  actionDisabled: {
    opacity: 0.5,
  },
});
