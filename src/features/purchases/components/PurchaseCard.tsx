import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, I18nManager } from 'react-native';
import { useI18n } from "@/hooks/use-i18n";
import { PurchaseCardProps } from '../types';
import { CATEGORY_META, DEFAULT_META, CURRENCY_SYMBOL, DELETE_BTN_WIDTH, SWIPE_THRESHOLD } from '../constants';
import { PurchaseCardStyles as styles } from '../styles';

export default function PurchaseCard({
  item,
  onPress,
  onDelete,
}: PurchaseCardProps) {
  const { t } = useI18n() as any;
  const isRtl = I18nManager.isRTL;
  
  const meta = item.category ? (CATEGORY_META[item.category] ?? DEFAULT_META) : DEFAULT_META;
  const symbol = item.currency ? (CURRENCY_SYMBOL[item.currency] ?? '$') : '$';
  const formattedAmount = `${symbol}${item.amount.toFixed(2)}`;
  
  const categoryName = item.category ? t(item.category) : '';
  const subtitle = categoryName ? `${categoryName} • ${item.time}` : item.time;

  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < 20,
      onPanResponderMove: (_, g) => {
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
