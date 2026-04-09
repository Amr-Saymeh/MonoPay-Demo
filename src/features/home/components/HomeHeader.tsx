import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from "@/hooks/use-i18n";   
import { useAuth } from '@/src/providers/AuthProvider';
import { homeStyles as styles } from '../styles';

export default function HomeHeader() {
  const { t } = useI18n();                  
  const { profile } = useAuth();

  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#B166F8', '#9B5DD4', '#566CB2']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.avatarWrapper}>
            <Ionicons name="person" size={30} color="#fff" />
          </View>
          <View style={styles.menuIcon}>
            <Ionicons name="menu-outline" size={32} color="#fff" />
          </View>

          <View style={styles.headerTextContainer}>
            <View style={styles.greetingWrapper}>
              <Text style={styles.greeting}>{t("goodEvening")}</Text>
            </View>

            <Text style={styles.welcome}>
              {t("welcomeBack")}{' '}
            </Text>
            <Text style={styles.name}>{profile?.name}</Text>
          </View>

          <View style={styles.notificationWrapper}>
            <Ionicons name="notifications-outline" size={26} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerBigCircle} />
      </LinearGradient>
    </View>
  );
}
