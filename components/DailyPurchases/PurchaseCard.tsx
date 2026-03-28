import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Animated, PanResponder, Dimensions,
} from 'react-native';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '@/src/firebaseConfig';

const DELETE_BTN_WIDTH = 80;
const SWIPE_THRESHOLD  = -60;

// ── أيقونة ولون حسب الـ category ────────────────────────────
const CATEGORY_META: Record<string, { icon: string; bg: string }> = {
  'Food & Drinks':  { icon: '🍔', bg: '#FFF0EB' },
  'Groceries':      { icon: '🛒', bg: '#E8FFF5' },
  'Transport':      { icon: '🚗', bg: '#E8F4FF' },
  'Health':         { icon: '💊', bg: '#FFE8F4' },
  'Shopping':       { icon: '🛍️', bg: '#F3EEFF' },
  'Entertainment':  { icon: '🎮', bg: '#FFF3E0' },
  'Bills':          { icon: '📄', bg: '#ECEFF1' },
  'Education':      { icon: '📚', bg: '#E0F2F1' },
  'Personal Care':  { icon: '✨', bg: '#F3E5F5' },
};
const DEFAULT_META = { icon: '📦', bg: '#F2F2F7' };

const CURRENCY_SYMBOL: Record<string, string> = {
  NIS: '₪',
  USD: '$',
  JOD: 'JD',
};

// ── Type ─────────────────────────────────────────────────────
type PurchaseItem = {
  id: string;
  title: string;
  amount: number;
  currency?: string;
  time: string;
  category?: string;
  isBundle?: boolean;
  createdAt: string;
};

// ── كارد واحدة — swipe to delete ────────────────────────────
function PurchaseCard({
  item,
  onPress,
  onDelete,
}: {
  item: PurchaseItem;
  onPress?: (item: PurchaseItem) => void;
  onDelete: (item: PurchaseItem) => void;
}) {
  const meta            = item.category ? (CATEGORY_META[item.category] ?? DEFAULT_META) : DEFAULT_META;
  const symbol          = item.currency ? (CURRENCY_SYMBOL[item.currency] ?? '$') : '$';
  const formattedAmount = `${symbol}${item.amount.toFixed(2)}`;
  const subtitle        = item.category ? `${item.category} • ${item.time}` : item.time;

  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen     = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dy) < 20,

      onPanResponderMove: (_, g) => {
        if (g.dx < 0) {
          translateX.setValue(Math.max(g.dx, -DELETE_BTN_WIDTH));
        }
      },

      onPanResponderRelease: (_, g) => {
        if (g.dx < SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -DELETE_BTN_WIDTH,
            useNativeDriver: true,
          }).start();
          isOpen.current = true;
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          isOpen.current = false;
        }
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    isOpen.current = false;
  };

  return (
    <View style={styles.cardWrapper}>

      {/* زر Delete خلف الكارد */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => {
            closeSwipe();
            onDelete(item);
          }}
        >
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* الكارد قابلة للسحب */}
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={() => {
            if (isOpen.current) { closeSwipe(); return; }
            onPress?.(item);
          }}
          activeOpacity={0.92}
        >
          <View style={styles.card}>

            <View style={[styles.iconContainer, { backgroundColor: meta.bg }]}>
              <Text style={styles.icon}>{meta.icon}</Text>
            </View>

            <View style={styles.content}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                {item.isBundle && (
                  <View style={styles.bundleBadge}>
                    <Text style={styles.bundleText}>BUNDLE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amount}>{formattedAmount}</Text>
            </View>

          </View>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

// ── القائمة الكاملة ───────────────────────────────────────────
export default function TodayPurchasesList({
  onPressItem,
}: {
  onPressItem?: (item: PurchaseItem) => void;
}) {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const purchasesRef = ref(db, 'purchases');

    const unsubscribe = onValue(purchasesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setPurchases([]);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const items: PurchaseItem[] = [];

      snapshot.forEach((child) => {
        const val      = child.val();
        const itemDate = val.createdAt?.split('T')[0];
        if (itemDate === today) {
          items.push({ id: child.key!, ...val });
        }
      });

      items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPurchases(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // حذف فعلي من Firebase — بدون Alert
  const handleDelete = async (item: PurchaseItem) => {
    try {
      await remove(ref(db, `purchases/${item.id}`));
    } catch {
      Alert.alert('Error', 'Could not delete. Try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C4DFF" />
      </View>
    );
  }

  if (purchases.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No purchases today yet 🛒</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={purchases}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PurchaseCard
          item={item}
          onPress={onPressItem}
          onDelete={handleDelete}
        />
      )}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 15,
    color: '#8e8e93',
  },

  // Swipe wrapper
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_BTN_WIDTH,
    borderRadius: 18,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  deleteActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // الكارد
  cardContainer: {
    // margin بالـ wrapper فوق
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 17.5,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  bundleBadge: {
    backgroundColor: '#7C4DFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  bundleText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 13.8,
    color: '#8e8e93',
    marginTop: 3,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1c1c1e',
  },
});