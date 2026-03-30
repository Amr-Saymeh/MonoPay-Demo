import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useI18n } from "@/hooks/use-i18n";
import { menuItems } from '../FeturesPage/icons';
import { useFeatures } from '@/src/providers/FeaturesProvider';

const customization = () => router.push("/CustomaztionFeture");

export default function QuickActions() {
  const { t } = useI18n();
  const { activeFeatures } = useFeatures();
 const handleNavigate = (item: any) => {
  if (item.route) {
    router.push(item.route);
  }
};

  return (
    <>
      <Text style={styles.title}>{t("quickActions")}</Text>

      <TouchableOpacity onPress={customization}>
        <Text style={styles.customization}>{t("customization")}</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        {menuItems
          .filter((item: any) => activeFeatures.includes(item.id) || item.id === '7')
          .map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.actionItem}
              onPress={() => handleNavigate(item)}
              
            >
              <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                <Ionicons name={item.iconName} size={40} color="white" />
              </View>
              <Text style={styles.label}>{t(item.titleKey)}</Text>
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
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#566CB2',
    textAlign: 'left',
    marginBottom: 5,
    marginTop: -15,
    marginLeft: 25,
    
  },
  actionItem: {
    alignItems: 'center',
    width: 90,
    marginBottom: 10,
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
   
  },
  label: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  customization: {
    fontSize: 13,
    textDecorationLine: 'underline',
    color: '#566CB2',
    marginBottom: 5,
    marginTop: -24,
    textAlign: 'right',
    fontWeight: '500',
    marginRight: 20,
  },
});