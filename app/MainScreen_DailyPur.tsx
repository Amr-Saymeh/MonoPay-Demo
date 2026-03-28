import DailyTotalCard from '../components/DailyPurchases/DailyTotalCard';

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import TodayPurchasesList from '@/components/DailyPurchases/PurchaseCard';
import DailyPurchasesForm from '@/components/DailyPurchases/form';


export default function MainScreen_DailyPur() {
  return (
    <ScrollView style={styles.container}>
      
    <DailyTotalCard />
    <DailyPurchasesForm />
    <TodayPurchasesList />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});