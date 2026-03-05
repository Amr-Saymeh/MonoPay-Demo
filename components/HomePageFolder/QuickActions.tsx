import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useI18n } from "@/hooks/use-i18n";

const actions = [
  { id: '1', key: 'savingGoals', iconName: 'wallet-outline' as const, color: '#4CAF50' },
  { id: '2', key: 'insights',    iconName: 'bar-chart-outline' as const, color: '#9C27B0' },
  { id: '3', key: 'cards',       iconName: 'card-outline' as const, color: '#FF5722' },
  { id: '4', key: 'more',        iconName: 'ellipsis-horizontal' as const, color: '#00BCD4' },
] as const;

const moreActions = () => router.push("/FeturesPage");

export default function QuickActions() {
  const { t } = useI18n();

  return (
    <>
      <Text style={styles.title}>{t("quickActions")}</Text>

      <View style={styles.container}>
        {actions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.actionItem}
            onPress={item.id === '4' ? moreActions : undefined}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
              <Ionicons name={item.iconName} size={40} color="white" />
            </View>
            <Text style={styles.label}>{t(item.key)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 10,
    
  },
    title: {    
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    textAlign: 'left',
    marginBottom: 5,
    marginTop: -15,
    marginLeft: 25,    
  },    
  actionItem: {
    alignItems: 'center',
    width: 90,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    backgroundAttachment: 'fixed', 
    
    
  },
  label: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});