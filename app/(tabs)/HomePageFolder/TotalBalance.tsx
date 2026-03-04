import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from "@/hooks/use-i18n";

export default function TotalBalance() {
  const { t } = useI18n();

  const totalBalance = '$24,562.80';
  const changePercent = ' from last month';
  const changePercentValue = '+5.2%';
  const income = '+$8,240.00';
  const expenses = '-$3,128.50';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#B166F8', '#864CBD', '#435799']}
        start={{ x: 0.1, y: 0.3 }}
        end={{ x: 0.9, y: 0.8 }}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.label}>{t("totalBalance")}</Text>

          <Text style={styles.balanceAmount}>{totalBalance}</Text>

          <View style={styles.changeRow}>
            <Ionicons name="trending-up" size={20} color="#00ff9d" />
            <Text style={styles.changeText}>{changePercentValue+t("changePercent")}</Text>
          </View>

          <View style={styles.incomeExpensesRow}>
            <View style={styles.column}>
              <Text style={styles.sectionLabel}>{t("income")}</Text>
              <Text style={[styles.amount, styles.incomeAmount]}>{income}</Text>
            </View>

            <View style={styles.column}>
              <Text style={styles.sectionLabel}>{t("expenses")}</Text>
              <Text style={[styles.amount, styles.expensesAmount]}>{expenses}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bigCircleRight} />
        <View style={styles.bigCircleLeft} />
      </LinearGradient>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginTop: -50,            
    marginBottom: 40,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },

  gradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    position: 'relative',
  },

  contentContainer: {
    alignItems: 'center',
  },

  label: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
  },

  balanceAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },

  changeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00ff9d',           
    marginLeft: 6,
  },

  incomeExpensesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },

  column: {
    alignItems: 'center',
    flex: 1,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },

  amount: {
    fontSize: 22,
    fontWeight: '700',
  },

  incomeAmount: {
    color: '#00ff9d',
    fontSize: 13,  
            paddingLeft: 20,       
  
  },

  expensesAmount: {
    color: '#ff4d6d',
        fontSize: 13,
        paddingLeft: -16,        
  },

  bigCircleRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 120,
    height: 120,
    backgroundColor: '#A866CC',
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    elevation: 6,
  },

  bigCircleLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 120,
    height: 120,
    backgroundColor: '#304FB5',
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    elevation: 6,
  },
});