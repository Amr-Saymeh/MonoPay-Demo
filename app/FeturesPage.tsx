import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useI18n } from "@/hooks/use-i18n";

const menuItems = [
  {
    id: '1',
    titleKey: 'myCards',
    subtitleKey: 'myCardsSubtitle',
    iconName: 'card-outline' as const,
    color: '#FF5722',
  },
  {
    id: '2',
    titleKey: 'exchangeRates',
    subtitleKey: 'exchangeRatesSubtitle',
    iconName: 'trending-up-outline' as const,
    color: '#2196F3',
  },
  {
    id: '3',
    titleKey: 'spendingInsights',
    subtitleKey: 'spendingInsightsSubtitle',
    iconName: 'bar-chart-outline' as const,
    color: '#9C27B0',
  },
  {
    id: '4',
    titleKey: 'savingGoals',
    subtitleKey: undefined,
    iconName: 'wallet-outline' as const,
    color: '#4CAF50',
  },
  {
    id: '5',
    titleKey: 'transactions',
    subtitleKey: undefined,
    iconName: 'receipt-outline' as const,
    color: '#00BCD4',
  },
  {
    id: '6',
    titleKey: 'settings',
    subtitleKey: 'settingsSubtitle',
    iconName: 'settings-outline' as const,
    color: '#607D8B',
  },
] as const;

const arrowBack = () => router.push("/HomePage");

export default function MenuList() {
  const { t } = useI18n();

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.headerTitle}>{t("features")}</Text>
      <Ionicons
        name="arrow-back"
        size={24}
        color="#111"
        style={styles.backButton}
        onPress={arrowBack}
      />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.item,
              index === menuItems.length - 1 && styles.lastItem,
            ]}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.iconName} size={26} color="white" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>{t(item.titleKey)}</Text>
              {item.subtitleKey && (
                <Text style={styles.itemSubtitle}>{t(item.subtitleKey)}</Text>
              )}
            </View>

            <Ionicons name="chevron-forward" size={22} color="#C0C0C0" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 100,
  },
  backButton: {
    position: 'absolute',
    top: 110,
    left: 20,
    zIndex: 1,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginLeft: 30,
    marginTop: 10,
  },

  scrollContainer: {
    flex: 1,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECEF',
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,          // زوايا مستديرة ناعمة
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    // ظل خفيف داخل الدائرة
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  textContainer: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  itemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },
});