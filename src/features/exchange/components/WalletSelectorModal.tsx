import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { WalletCard } from '../hooks/useWallets';

interface WalletSelectorModalProps {
  visible: boolean;
  wallets: WalletCard[];
  selectedWalletId: number | null;
  onSelect: (walletId: number) => void;
  onClose: () => void;
}

export const WalletSelectorModal: React.FC<WalletSelectorModalProps> = ({
  visible,
  wallets,
  selectedWalletId,
  onSelect,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Wallet</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>
          {wallets.map((wallet) => (
            <TouchableOpacity
              key={wallet.userWalletKey}
              style={[
                styles.option,
                wallet.walletid === selectedWalletId && styles.optionSelected,
              ]}
              onPress={() => {
                onSelect(wallet.walletid);
                onClose();
              }}
            >
              <Text style={styles.emoji}>{wallet.emoji || '💳'}</Text>
              <Text style={styles.name}>{wallet.name}</Text>
              {wallet.walletid === selectedWalletId && (
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
  emoji: {
    fontSize: 22,
    marginRight: 12,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
});
