import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type WalletCard = {
  userWalletKey: string;
  walletid: number;
  name: string;
  emoji?: string;
};

interface HeaderProps {
  baseCurrency: string;
  onRefresh: () => void;
  refreshing: boolean;
  wallets?: WalletCard[];
  selectedWalletId?: number | null;
  onWalletChange?: (walletId: number) => void;
  walletCurrencies?: string[];
  onCurrencyChange?: (currency: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  baseCurrency,
  onRefresh,
  refreshing,
  wallets = [],
  selectedWalletId,
  onWalletChange,
  walletCurrencies = [],
  onCurrencyChange,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const selectedWallet = wallets.find((w) => w.walletid === selectedWalletId);

  useEffect(() => {
    if (refreshing) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, [refreshing, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Exchange Rates</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <FontAwesome name="refresh" size={24} color="black" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Wallet and Currency Dropdowns - Side by Side */}
      <View style={styles.selectorsRow}>
        {/* Wallet Selector */}
        <TouchableOpacity
          style={styles.selectorHalf}
          onPress={() => setShowWalletModal(true)}
        >
          <View style={styles.selectorInner}>
            <Text style={styles.selectorLabel}>Wallet</Text>
            <Text
              style={styles.selectorValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedWallet?.emoji} {selectedWallet?.name || 'Select'}
            </Text>
            <FontAwesome name="chevron-down" size={12} color="black" />
          </View>
        </TouchableOpacity>

        {/* Currency Selector */}
        <TouchableOpacity
          style={styles.selectorHalf}
          onPress={() => setShowCurrencyModal(true)}
        >
          <View style={styles.selectorInner}>
            <Text style={styles.selectorLabel}>Currency</Text>
            <Text style={styles.selectorValue}>{baseCurrency}</Text>
            <FontAwesome name="chevron-down" size={12} color="black" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Wallet Modal */}
      <Modal
        visible={showWalletModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Wallet</Text>
              <TouchableOpacity onPress={() => setShowWalletModal(false)}>
                <Text style={styles.modalCloseButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={wallets}
              keyExtractor={(item) => item.userWalletKey}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    onWalletChange?.(item.walletid);
                    setShowWalletModal(false);
                  }}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionEmoji}>{item.emoji}</Text>
                    <Text
                      style={[
                        styles.optionText,
                        item.walletid === selectedWalletId && styles.optionSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                  {item.walletid === selectedWalletId && (
                    <FontAwesome name="check" size={16} color="#0066cc" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Text style={styles.modalCloseButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={walletCurrencies}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    onCurrencyChange?.(item);
                    setShowCurrencyModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item === baseCurrency && styles.optionSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === baseCurrency && (
                    <FontAwesome name="check" size={16} color="#0066cc" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
    paddingTop: 64,
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  selectorsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  selectorHalf: {
    flex: 1,
  },
  selectorInner: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectorValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalCloseButton: {
    fontSize: 28,
    color: '#666',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  optionSelected: {
    color: '#0066cc',
    fontWeight: '600',
  },
});

export default Header;
