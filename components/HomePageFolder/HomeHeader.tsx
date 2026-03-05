import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from "@/hooks/use-i18n";   
import { useAuth } from '@/src/providers/AuthProvider';

export default function HomeHeader() {
  const { t } = useI18n();                  
     const { profile } = useAuth();
;                

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#B166F8', '#9B5DD4', '#566CB2']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.topRow}>
          <View style={styles.avatarWrapper}>
            <Ionicons name="person" size={30} color="#fff" />
          </View>
          <View style={styles.menuIcon}>
            <Ionicons name="menu-outline" size={32} color="#fff" />
          </View>

          <View style={styles.textContainer}>
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

        <View style={styles.bigCircle} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 40,
    marginBottom: 70,         
    borderBottomEndRadius: 24,
        borderBottomStartRadius: 24,

    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  gradient: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,          
    position: 'relative',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
avatarWrapper: {
  width: 54,
  height: 54,
  borderRadius: 27,
  backgroundColor: 'rgba(255,255,255,0.25)',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.5)',
  
  marginTop: 50,
  marginLeft: 10,       
   marginRight: 12,   
},
  textContainer: {
    flex: 1,
  },

  greetingWrapper: {
    width: '100%',
    alignItems: 'center',
  },

  greeting: {
    fontSize: 17,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.9,
    marginBottom: 30,
    paddingRight: 25,       
  },
  menuIcon: {
    position: 'absolute',
    top: -3,
    left: 16,
    opacity: 0.9,
  },

  welcome: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',

  },

  name: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 24,
  },

  notificationWrapper: {
    position: 'relative',
    top: -38,               
    
  },

  badge: {
    position: 'absolute',
    top:-4,
    right: -4,
    backgroundColor: '#ef4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.8,
    borderColor: '#fff',
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  bigCircle: {
    position: 'absolute',
    bottom: -50,
    right: -60,              
    width: 100,
    height: 100,
    backgroundColor: '#A866CC',
    borderRadius: 50,
    borderColor: 'rgba(255,255,255,0.25)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
     
    borderWidth: 2,
  },
});