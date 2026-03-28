import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useI18n } from "@/hooks/use-i18n";
import { ref, push, set } from "firebase/database";
import { db } from '@/src/firebaseConfig';

type FormValues = {
  name: string;
  cost: string;
  currency: 'NIS' | 'USD' | 'JOD';
};

export default function DailyPurchasesForm() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      cost: '',
      currency: 'NIS',
    },
  });

  const selectedCurrency = watch('currency');

  const getPlaceholder = () => {
    switch (selectedCurrency) {
      case 'USD':
        return '$0.00';
      case 'JOD':
        return 'JD 0.00';
      default:
        return '₪ 0.00';
    }
  };

  // دالة إضافة المشتراة إلى Firebase
  const onSubmit = async (data: FormValues) => {
    if (!data.name.trim() || !data.cost) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const now = new Date();

      const purchaseData = {
        title: data.name.trim(),
        amount: parseFloat(data.cost),
        currency: data.currency,
        time: now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        createdAt: now.toISOString(),           // وقت كامل ISO
        category: "Other",                      // يمكنك تغييره لاحقاً
        isBundle: false,
      };

      // إضافة إلى Realtime Database باستخدام push() → يولد ID تلقائي
      const purchasesRef = ref(db, 'purchases');
      const newPurchaseRef = push(purchasesRef);

      await set(newPurchaseRef, purchaseData);

      Alert.alert('Success', 'Purchase added successfully!');

      // إعادة تعيين الفورم بعد الإضافة الناجحة
      reset();

    } catch (error: any) {
      console.error('Error adding purchase:', error);
      Alert.alert('Error', 'Failed to add purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Add New Purchase</Text>

      {/* NAME */}
      <Controller
        control={control}
        name="name"
        rules={{
          required: "Name is required",
          minLength: { value: 2, message: "Minimum 2 characters" }
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              placeholder={t('name') || "Purchase Name"}
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
            {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
          </>
        )}
      />

      {/* COST + CURRENCY */}
      <View style={styles.row}>
        {/* COST */}
        <Controller
          control={control}
          name="cost"
          rules={{
            required: "Cost is required",
            pattern: {
              value: /^[0-9]+(\.[0-9]{1,2})?$/,
              message: "Invalid price format"
            }
          }}
          render={({ field: { onChange, value } }) => (
            <View style={{ flex: 2 }}>
              <TextInput
                placeholder={getPlaceholder()}
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                style={styles.input}
              />
              {errors.cost && <Text style={styles.error}>{errors.cost.message}</Text>}
            </View>
          )}
        />

        {/* CURRENCY SELECTOR */}
        <Controller
          control={control}
          name="currency"
          render={({ field: { onChange, value } }) => (
            <View style={styles.radioGroup}>
              {(['NIS', 'USD', 'JOD'] as const).map((cur) => (
                <TouchableOpacity
                  key={cur}
                  onPress={() => onChange(cur)}
                  style={[
                    styles.radioButton,
                    value === cur && styles.radioButtonSelected,
                  ]}
                >
                  <Text style={[
                    styles.radioText,
                    value === cur && styles.radioTextSelected,
                  ]}>
                    {cur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={[styles.addButton, loading && styles.addButtonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        <Text style={styles.addButtonText}>
          {loading ? 'Adding...' : 'Add Purchase'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 15,
  },
  input: {
    padding: 14,
    borderRadius: 15,
    marginBottom: 8,
    backgroundColor: '#E1E2E7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  radioGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#E1E2E7',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#4F00D0',
    borderColor: '#4F00D0',
  },
  radioText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  radioTextSelected: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#4F00D0',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonDisabled: {
    backgroundColor: '#a38eff',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});