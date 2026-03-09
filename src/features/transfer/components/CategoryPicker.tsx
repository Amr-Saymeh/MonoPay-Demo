import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CATEGORIES, Category } from "../types/index";

interface Props {
  label: string;
  selected: Category | null;
  onSelect: (category: Category) => void;
  isRtl?: boolean;
  language?: string;
}

export function CategoryPicker({
  label,
  selected,
  onSelect,
  isRtl = false,
  language = "en",
}: Props) {
  const [visible, setVisible] = useState(false);

  const getCategoryLabel = (cat: Category) =>
    language === "ar" ? cat.labelAr : cat.label;

  const handleSelect = (cat: Category) => {
    onSelect(cat);
    setVisible(false);
  };

  return (
    <>
      {/* Trigger */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="bg-white rounded-2xl flex-row items-center justify-between px-4 h-16 shadow-sm"
        activeOpacity={0.7}
      >
        {selected ? (
          <View className="flex-row items-center gap-3 flex-1">
            <Text className="text-2xl">{selected.emoji}</Text>
            <Text className="text-gray-800 font-medium">
              {getCategoryLabel(selected)}
            </Text>
          </View>
        ) : (
          <Text className="text-gray-400 flex-1">{label}</Text>
        )}
        <Text className="text-gray-400">›</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setVisible(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 bg-gray-200 rounded-full" />
            </View>

            <View className="px-5 pb-2 pt-3">
              <Text className="text-lg font-bold text-gray-800 mb-4">
                {language === "ar" ? "اختر الفئة" : "Select Category"}
              </Text>

              <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item.key}
                numColumns={2}
                style={{ maxHeight: 380 }}
                columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
                renderItem={({ item }) => {
                  const isSelected = selected?.key === item.key;
                  return (
                    <TouchableOpacity
                      onPress={() => handleSelect(item)}
                      className={`flex-1 flex-row items-center gap-2 p-3 rounded-2xl ${
                        isSelected
                          ? "bg-violet-100 border border-violet-300"
                          : "bg-gray-50"
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text className="text-xl">{item.emoji}</Text>
                      <Text
                        className={`text-sm font-medium flex-1 ${
                          isSelected ? "text-violet-700" : "text-gray-700"
                        }`}
                        numberOfLines={1}
                      >
                        {getCategoryLabel(item)}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
              <View className="h-6" />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
