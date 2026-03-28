import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  I18nManager,
} from 'react-native';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '@/src/firebaseConfig';
import { useI18n } from "@/hooks/use-i18n";

const DELETE_BTN_WIDTH = 80;
const SWIPE_THRESHOLD = 60; // القيمة مطلقة للتعامل مع الاتجاهين

const CATEGORY_META: Record<string, { icon: string; bg: string }> = {
  'foodDrinks': { icon: '🍔', bg: '#FFF0EB' },
  'groceries': { icon: '🛒', bg: '#E8FFF5' },
  'transport': { icon: '🚗', bg: '#E8F4FF' },
  'health': { icon: '💊', bg: '#FFE8F4' },
  'shopping': { icon: '🛍️', bg: '#F3EEFF' },
  'entertainment': { icon: '🎮', bg: '#FFF3E0' },
  'bills': { icon: '📄', bg: '#ECEFF1' },
  'education': { icon: '📚', bg: '#E0F2F1' },
  'personalCare': { icon: '✨', bg: '#F3E5F5' },
};

const DEFAULT_META = { icon: '📦', bg: '#F2F2F7' };

const CURRENCY_SYMBOL: Record<string, string> = {
  NIS: '₪',
  USD: '$',
  JOD: 'JD',
};

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

// ====================== PurchaseCard ======================
function PurchaseCard({
  item,
  onPress,
  onDelete,
}: {
  item: PurchaseItem;
  onPress?: (item: PurchaseItem) => void;
  onDelete: (item: PurchaseItem) => void;
}) {
  const { t } = useI18n();
  const isRtl = I18nManager.isRTL;
  
  // اختيار الأيقونة واللون بناءً على مفتاح التصنيف
  const meta = item.category ? (CATEGORY_META[item.category] ?? DEFAULT_META) : DEFAULT_META;
  const symbol = item.currency ? (CURRENCY_SYMBOL[item.currency] ?? '$') : '$';
  const formattedAmount = `${symbol}${item.amount.toFixed(2)}`;
  
  // ترجمة اسم التصنيف إذا وجد
  const categoryName = item.category ? t(item.category as any) : '';
  const subtitle = categoryName ? `${categoryName} • ${item.time}` : item.time;

  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < 20,
      onPanResponderMove: (_, g) => {
        // في العربي نسحب لليمين، في الإنجليزي نسحب لليسار
        const dragAmount = isRtl ? Math.max(0, Math.min(g.dx, DELETE_BTN_WIDTH)) : Math.min(0, Math.max(g.dx, -DELETE_BTN_WIDTH));
        translateX.setValue(dragAmount);
      },
      onPanResponderRelease: (_, g) => {
        const shouldOpen = isRtl ? g.dx > SWIPE_THRESHOLD : g.dx < -SWIPE_THRESHOLD;
        const toValue = shouldOpen ? (isRtl ? DELETE_BTN_WIDTH : -DELETE_BTN_WIDTH) : 0;
        
        Animated.spring(translateX, {
          toValue,
          useNativeDriver: true,
        }).start();
        isOpen.current = shouldOpen;
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    isOpen.current = false;
  };

  return (
    <View style={styles.cardWrapper}>
      {/* خلفية الحذف - تتغير مكانها حسب الاتجاه */}
      <View style={[styles.deleteBackground, isRtl ? { left: 0 } : { right: 0 }]}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => {
            closeSwipe();
            onDelete(item);
          }}
        >
          <Text style={styles.deleteActionText}>{t('delete').toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.card, isRtl && { flexDirection: 'row-reverse' }]}
          onPress={() => {
            if (isOpen.current) {
              closeSwipe();
              return;
            }
            onPress?.(item);
          }}
          activeOpacity={0.92}
        >
          <View style={[styles.iconContainer, { backgroundColor: meta.bg }, isRtl ? { marginLeft: 16 } : { marginRight: 16 }]}>
            <Text style={styles.icon}>{meta.icon}</Text>
          </View>

          <View style={[styles.content, isRtl && { alignItems: 'flex-end' }]}>
            <View style={[styles.titleRow, isRtl && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.title, isRtl && { textAlign: 'right' }]}>{item.title}</Text>
              {item.isBundle && (
                <View style={styles.bundleBadge}>
                  <Text style={styles.bundleText}>BUNDLE</Text>
                </View>
              )}
            </View>
            <Text style={[styles.subtitle, isRtl && { textAlign: 'right' }]}>{subtitle}</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amount}>{formattedAmount}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ====================== TodayPurchasesList ======================
export default function TodayPurchasesList({
  onPressItem,
}: {
  onPressItem?: (item: PurchaseItem) => void;
}) {
  const { t } = useI18n();
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        const val = child.val();
        const itemDate = val.createdAt?.split('T')[0];
        if (itemDate === today) {
          items.push({ id: child.key!, ...val });
        }
      });

      items.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPurchases(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (item: PurchaseItem) => {
    Alert.alert(
      t('deletePurchase'), // استخدام ترجمة عنوان الحذف
      `${t('deleteWalletConfirmMessage')} "${item.title}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(ref(db, `purchases/${item.id}`));
            } catch (error) {
              Alert.alert(t('error'), t('uploadFailed'));
            }
          },
        },
      ]
    );
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
        <Text style={styles.emptyText}>{t('noPendingUsers')} 🛒</Text> 
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: 30 }}>
      {purchases.map((item) => (
        <PurchaseCard
          key={item.id}
          item={item}
          onPress={onPressItem}
          onDelete={handleDelete}
        />
      ))}
    </View>
  );
}

// ====================== Styles ======================
const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e93',
  },
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  deleteBackground: {
    position: 'absolute',
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
  },
  subtitle: {
    fontSize: 13.8,
    color: '#8e8e93',
    marginTop: 3,
  },
  amountContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  amount: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1c1c1e',
  },
});