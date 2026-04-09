import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from "@/hooks/use-i18n";   
import { homeStyles as styles } from '../styles';

export default function Advertisement() {
  const { t } = useI18n();                    
  return (
    <View style={styles.adContainer}>
      <LinearGradient
        colors={['#B166F8', '#9B5DD4', '#566CB2']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.adGradient}
      >
        <View style={styles.adContent}>
          <Text style={styles.adText}>{t("advertisement")}</Text>
        </View>

        <View style={styles.adBigCircleRight} />
        <View style={styles.adBigCircleLeft} />
      </LinearGradient>
    </View>
  );
}
