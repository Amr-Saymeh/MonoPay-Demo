import React, { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { CURRENCY_SYMBOLS } from "../types/index";

interface Props {
  amount: string;
  currency: string;
  availableCurrencies: string[];
  onAmountChange: (val: string) => void;
  onCurrencyChange: (val: string) => void;
  isRtl?: boolean;
  placeholder?: string;
}

export function AmountInput({
  amount,
  currency,
  availableCurrencies,
  onAmountChange,
  onCurrencyChange,
  isRtl = false,
  placeholder = "0.00",
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const symbol = CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();

  const handleAmountChange = (text: string) => {
    // Allow only valid decimal numbers
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[0] && parts[0].length > 4) return;
    if (parts[1] && parts[1].length > 2) return;
    onAmountChange(cleaned);
  };

  return (
    <>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        className="bg-white rounded-2xl flex-row items-center px-4 h-16 shadow-sm"
        style={{ direction: isRtl ? "rtl" : "ltr" }}
      >
        {/* Currency Selector */}
        <TouchableOpacity
          onPress={() => availableCurrencies.length > 1 && setShowPicker(true)}
          className="flex-row items-center gap-1 pr-3 border-r border-gray-200 mr-3"
          activeOpacity={availableCurrencies.length > 1 ? 0.6 : 1}
        >
          <Text className="text-violet-600 font-bold text-xl">{symbol}</Text>
          {availableCurrencies.length > 1 && (
            <Text className="text-gray-400 text-xs">▾</Text>
          )}
        </TouchableOpacity>

        {/* Amount Input */}
        <TextInput
          ref={inputRef}
          value={amount}
          onChangeText={handleAmountChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="flex-1 text-2xl font-bold text-gray-800"
          textAlign={isRtl ? "right" : "left"}
          returnKeyType="done"
        />
      </Pressable>

      {/* Currency Picker Modal */}
      {availableCurrencies.length > 1 && (
        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <Pressable
            className="flex-1 bg-black/50 justify-end"
            onPress={() => setShowPicker(false)}
          >
            <View className="bg-white rounded-t-3xl p-6">
              <Text className="text-lg font-bold text-gray-800 mb-4 text-center">
                Select Currency
              </Text>
              {availableCurrencies.map((cur) => {
                const isSelected = cur === currency;
                return (
                  <TouchableOpacity
                    key={cur}
                    onPress={() => {
                      onCurrencyChange(cur);
                      setShowPicker(false);
                    }}
                    className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
                      isSelected ? "bg-violet-50 border border-violet-200" : "bg-gray-50"
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <Text className="text-2xl font-bold text-violet-600">
                        {CURRENCY_SYMBOLS[cur] ?? cur.toUpperCase()}
                      </Text>
                      <Text className="text-gray-700 font-medium">
                        {cur.toUpperCase()}
                      </Text>
                    </View>
                    {isSelected && (
                      <Text className="text-violet-600 font-bold">✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}
