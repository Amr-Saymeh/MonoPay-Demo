import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type PurchaseItem = {
  id: string;
  title: string;
  amount: number;
  time: string;           // مثال: "11:45 AM"
  category?: string;      // مثال: "Groceries", "Transport", "Food"
  isBundle?: boolean;
};

type Props = {
  item: PurchaseItem;
  onPress?: (item: PurchaseItem) => void;
};

export default function PurchaseCard({ item, onPress }: Props) {
  const formattedAmount = `$${item.amount.toFixed(2)}`;

  // بناء الـ subtitle مع الوقت + الفئة
  const subtitle = item.category 
    ? `${item.category} • ${item.time}` 
    : item.time;

  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      onPress={() => onPress?.(item)}
      activeOpacity={0.92}
    >
      <View style={styles.card}>
        
        {/* أيقونة عامة مشتركة */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🛍️</Text>
        </View>

        {/* المحتوى الرئيسي */}
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

        {/* السعر */}
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formattedAmount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
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

  // الأيقونة العامة المشتركة
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#f8f6ff',
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