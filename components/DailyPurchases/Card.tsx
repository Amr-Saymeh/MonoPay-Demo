import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const THEME = {
  primary: '#7C4DFF',
  primaryLight: '#a77ffdff',
  tertiary: '#00C853',
};

type Props = {
  /** Amount spent */
  spentAmount?: number;
  /** Currency symbol */
  currency?: string;
  /** Budget percentage (0-100) */
  budgetPercent?: number;
  /** Card title label */
  label?: string;
  /** Description text */
  description?: string;
  /** Image - if provided, fills the entire card */
  image?: ImageSourcePropType;
};

export default function Card({
  spentAmount,
  currency,
  budgetPercent,
  label,
  description,
  image,
}: Props) {
  const formattedAmount = spentAmount !== undefined 
    ? `${currency}${spentAmount.toFixed(2)}` 
    : '';

  // حالة وجود صورة → تملأ الكارد كاملاً
  if (image) {
    return (
      <View style={styles.container}>
        <Image
          source={image}
          style={styles.fullImage}
          resizeMode="cover"
        />

        <View style={styles.contentOverlay}>
          {label && <Text style={styles.label}>{label}</Text>}
          
          
          {<Text style={styles.description}>{`You saved ${spentAmount?.toFixed(2)}  ${currency} this week by choosing \"Routine\" bundles.`}</Text>}

         
        </View> 
      </View>
    );
  }

  // حالة بدون صورة → Gradient Design
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[THEME.primaryLight, THEME.primary, '#5C2ECC']}
        start={{ x: 1, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />

        <View style={styles.content}>
          {label && <Text style={styles.label}>{label}</Text>}
          
          {formattedAmount && <Text style={styles.amount}>{formattedAmount}</Text>}
          
          {description && <Text style={styles.description}>{description}</Text>}

          {budgetPercent !== undefined && budgetPercent > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {budgetPercent}% OF DAILY BUDGET
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  // مع صورة
  fullImage: {
    width: '100%',
    height: 200,
    borderRadius: 40,
  },
  contentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 30,
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
  },

  // بدون صورة
  gradient: {
    minHeight: 200,
    borderRadius: 40,
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 30,
    paddingVertical: 30,
    zIndex: 3,
  },
  circleTopRight: {
    position: 'absolute',
    top: -60,
    right: -43,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    zIndex: 1,
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    zIndex: 1,
  },

  // النصوص
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: -90,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.tertiary,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#0c0c0cff',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});