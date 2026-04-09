import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CURRENCY_NAMES, normalizeCurrency } from '../utils/currency';

interface CurrencySelectorModalProps {
  visible: boolean;
  currencies: string[];
  selectedCurrency: string;
  title: string;
  onSelect: (currency: string) => void;
  onClose: () => void;
}

export const CurrencySelectorModal: React.FC<CurrencySelectorModalProps> = ({
  visible,
  currencies,
  selectedCurrency,
  title,
  onSelect,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>
          {currencies.map((currency) => (
            <TouchableOpacity
              key={currency}
              style={[
                styles.option,
                normalizeCurrency(currency) === normalizeCurrency(selectedCurrency) &&
                  styles.optionSelected,
              ]}
              onPress={() => {
                onSelect(currency);
                onClose();
              }}
            >
              <View style={styles.info}>
                <Text style={styles.code}>{currency}</Text>
                <Text style={styles.name}>{CURRENCY_NAMES[currency]}</Text>
              </View>
              {normalizeCurrency(currency) === normalizeCurrency(selectedCurrency) && (
                <FontAwesome name="check" size={16} color="#6366f1" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  close: {
    fontSize: 28,
    color: '#64748b',
    lineHeight: 28,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionSelected: {
    backgroundColor: '#f8fafc',
  },
  info: {
    flex: 1,
  },
  code: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  name: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
});
