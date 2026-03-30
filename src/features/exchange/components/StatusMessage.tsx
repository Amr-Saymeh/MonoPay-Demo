import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusMessageProps {
  error: string | null;
  success: boolean;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ error, success }) => {
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <FontAwesome name="check-circle" size={20} color="#22c55e" />
        <Text style={styles.successText}>Exchange successful!</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
  },
});
