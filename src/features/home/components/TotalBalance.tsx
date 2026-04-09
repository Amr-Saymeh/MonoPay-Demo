import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from "@/hooks/use-i18n";
import { homeStyles as styles } from '../styles';

export default function TotalBalance() {
  const { t } = useI18n();

  const totalBalance = "$12,345.67";
  const changePercent = ' from last month';
  const changePercentValue = '+5.2%';
  const income = '+$8,240.00';
  const expenses = '-$3,128.50';

  return (
    <View style={styles.balanceContainer}>
      <LinearGradient
        colors={['#B166F8', '#864CBD', '#435799']}
        start={{ x: 0.1, y: 0.3 }}
        end={{ x: 0.9, y: 0.8 }}
        style={styles.balanceGradient}
      >
        <View style={styles.balanceContentContainer}>
          <Text style={styles.balanceLabel}>{t("totalBalance")}</Text>

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

        <View style={styles.balanceBigCircleRight} />
        <View style={styles.balanceBigCircleLeft} />
      </LinearGradient>
    </View>
  );
}
