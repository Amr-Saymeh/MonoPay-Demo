import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from "@/hooks/use-i18n";   

export default function Advertisement() {
  const { t } = useI18n();                    
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#B166F8', '#9B5DD4', '#566CB2']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.adText}>{t("advertisement")}</Text>
        </View>

        <View style={styles.bigCircleRight} />
        <View style={styles.bigCircleLeft} />
      </LinearGradient>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  gradient: {
    paddingVertical: 60,         
    paddingHorizontal: 20,
    position: 'relative',
    minHeight: 180,             
  },
  content: {
    flex: 1,
    justifyContent: 'center',    
    alignItems: 'center',         
  },

  adText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
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