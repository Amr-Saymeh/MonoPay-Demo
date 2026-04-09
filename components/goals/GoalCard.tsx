// components/goals/GoalCard.tsx
import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, Pressable, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { GradientButton } from '@/components/ui/gradient-button';
import { ProgressBar } from './ProgressBar';
import { useI18n } from '@/hooks/use-i18n';
import { MaterialIcons } from '@expo/vector-icons';

interface GoalCardProps {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  targetCurrency: string;
  targetDate: number;
  onContribute: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  id,
  title,
  currentAmount,
  targetAmount,
  targetCurrency,
  targetDate,
  onContribute,
  onEdit,
  onDelete,
}) => {
  const { t } = useI18n();
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [isDeleting, setIsDeleting] = useState(false);
  
  const progress = targetAmount > 0 ? currentAmount / targetAmount : 0;
  const remainingAmount = targetAmount - currentAmount;
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  };
  
  const triggerShake = () => {
    setIsDeleting(true);
    
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handleDelete = () => {
    triggerShake();
  };

  return (
    <Animated.View
      style={[
        styles.card,
        { transform: [{ translateX: shakeAnimation }] },
      ]}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <View style={styles.actions}>
          <Pressable onPress={onEdit} style={styles.iconButton}>
            <MaterialIcons name="edit" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.iconButton}>
            <MaterialIcons name="delete" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.amountRow}>
          <ThemedText style={styles.amount}>
            {formatCurrency(currentAmount, targetCurrency)}
          </ThemedText>
          <ThemedText style={styles.remaining}>
            {formatCurrency(remainingAmount, targetCurrency)} {t('goals.remaining')}
          </ThemedText>
        </View>
        
        <ProgressBar progress={progress} />
        
        <View style={styles.footer}>
          <ThemedText style={styles.date}>
            {formatDate(targetDate)}
          </ThemedText>
          <ThemedText style={styles.target}>
            {formatCurrency(targetAmount, targetCurrency)}
          </ThemedText>
        </View>
      </View>
      
      <GradientButton 
        label={t('goals.contribute')} 
        onPress={onContribute} 
        style={styles.button}
      />
      
      {isDeleting && (
        <View style={styles.confirmationOverlay}>
          <ThemedText style={styles.confirmText}>
            {t('goals.deleteConfirm')}
          </ThemedText>
          <View style={styles.confirmButtons}>
            <Pressable onPress={() => setIsDeleting(false)}>
              <ThemedText style={styles.cancelButton}>
                {t('common.cancel')}
              </ThemedText>
            </Pressable>
            <Pressable onPress={onDelete}>
              <ThemedText style={styles.deleteButton}>
                {t('common.delete')}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  content: {
    gap: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  remaining: {
    fontSize: 14,
    color: '#EDE9FE',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  date: {
    fontSize: 12,
    color: '#EDE9FE',
  },
  target: {
    fontSize: 12,
    color: '#EDE9FE',
  },
  button: {
    marginTop: 16,
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  deleteButton: {
    color: '#EF4444',
    fontWeight: '600',
  },
});
