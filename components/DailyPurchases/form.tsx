import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
  I18nManager,
  Keyboard
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useI18n } from "@/hooks/use-i18n";
import { ref, push, set, onValue } from "firebase/database";
import { db } from '@/src/firebaseConfig';

const CATEGORIES = [
  { labelKey: 'foodDrinks', icon: '🍔' },
  { labelKey: 'groceries',  icon: '🛒' },
  { labelKey: 'transport',  icon: '🚗' },
  { labelKey: 'health',     icon: '💊' },
  { labelKey: 'shopping',   icon: '🛍️' },
  { labelKey: 'entertainment', icon: '🎮' },
  { labelKey: 'bills',      icon: '📄' },
  { labelKey: 'education',  icon: '📚' },
  { labelKey: 'personalCare', icon: '✨' },
];

type FormValues = {
  name: string;
  cost: string;
  currency: 'NIS' | 'USD' | 'JOD';
  category: string;
};

export default function DailyPurchasesForm() {
  const { t, locale } = useI18n() as any; 
  const isRtl = locale === 'ar' || I18nManager.isRTL;
  
  const [loading, setLoading] = useState(false);
  const [allPastPurchases, setAllPastPurchases] = useState<string[]>([]);

  const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '',
      cost: '',
      currency: 'NIS',
      category: 'shopping',
    },
  });

  const nameInput = watch('name');
  const selectedCurrency = watch('currency');

  // جلب البيانات مع التأكد من نوع البيانات لتجنب خطأ toLowerCase
  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'purchases'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const names = Object.values(data)
          .map((item: any) => item.title)
          .filter(title => title && typeof title === 'string');
        setAllPastPurchases(Array.from(new Set(names)));
      }
    });
    return () => unsubscribe();
  }, []);

  // تصفية المقترحات للشريط الأفقي
  const filteredSuggestions = useMemo(() => {
    if (!nameInput || typeof nameInput !== 'string' || nameInput.trim() === '') return [];
    return allPastPurchases.filter(n => 
      n.toLowerCase().includes(nameInput.toLowerCase()) && n !== nameInput
    ).slice(0, 6); 
  }, [nameInput, allPastPurchases]);

  const onSubmit = async (data: FormValues) => {
    if (!data.name.trim() || !data.cost) {
      Alert.alert(t('error' as any), t('fillAllFields' as any));
      return;
    }
    setLoading(true);
    try {
      const now = new Date();
      await set(push(ref(db, 'purchases')), {
        title: data.name.trim(),
        amount: parseFloat(data.cost),
        currency: data.currency,
        category: data.category,
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        createdAt: now.toISOString(),
        isBundle: false,
      });
      Alert.alert(t('success' as any), t('purchaseAdded' as any));
      reset();
    } catch (e) {
      Alert.alert(t('error' as any), t('uploadFailed' as any));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isRtl && { textAlign: 'right' }]}>{t('addNewPurchase' as any)}</Text>

      {/* حقل الاسم مع إضافة شريط المقترحات الجديد */}
      <View style={styles.inputWrapper}>
        <Controller
          control={control}
          name="name"
          rules={{ required: t('fieldRequired' as any) }}
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput
                placeholder={t('name' as any)}
                value={value}
                onChangeText={onChange}
                style={[styles.input, isRtl && { textAlign: 'right' }]}
              />
              {/* شريط المقترحات الأفقي الجديد */}
              {filteredSuggestions.length > 0 && (
                <View style={styles.quickSuggestionsContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always">
                    {filteredSuggestions.map((item, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.suggestionChip}
                        onPress={() => {
                          setValue('name', item);
                          Keyboard.dismiss();
                        }}
                      >
                        <Text style={styles.suggestionChipText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        />
        {errors.name && <Text style={[styles.error, isRtl && { textAlign: 'right' }]}>{errors.name.message}</Text>}
      </View>

      {/* حقل السعر والعملة كما كان سابقاً */}
      <View style={[styles.row, isRtl && { flexDirection: 'row-reverse' }]}>
        <Controller
          control={control}
          name="cost"
          rules={{ required: t('fieldRequired' as any) }}
          render={({ field: { onChange, value } }) => (
            <View style={{ flex: 2 }}>
              <TextInput
                placeholder={selectedCurrency === 'USD' ? '$0.00' : selectedCurrency === 'JOD' ? 'JD 0.00' : '₪ 0.00'}
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                style={[styles.input, isRtl && { textAlign: 'right' }]}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="currency"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.radioGroup, isRtl && { flexDirection: 'row-reverse' }]}>
              {(['NIS', 'USD', 'JOD'] as const).map((cur) => (
                <TouchableOpacity
                  key={cur}
                  onPress={() => onChange(cur)}
                  style={[styles.radioButton, value === cur && styles.radioButtonSelected]}
                >
                  <Text style={[styles.radioText, value === cur && styles.radioTextSelected]}>{cur}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {/* التصنيفات كما كانت سابقاً */}
      <Text style={[styles.categoryTitle, isRtl && { textAlign: 'right' }]}>{t('category' as any)}</Text>
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.labelKey}
                onPress={() => onChange(cat.labelKey)}
                style={[styles.categoryChip, value === cat.labelKey && styles.categoryChipSelected]}
              >
                <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryChipText, value === cat.labelKey && styles.categoryChipTextSelected]}>
                  {t(cat.labelKey as any)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      />

      <TouchableOpacity
        style={[styles.addButton, loading && styles.addButtonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>{t('addPurchase' as any)}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  inputWrapper: { marginBottom: 15 },
  label: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 15 },
  input: { padding: 14, borderRadius: 15, backgroundColor: '#E1E2E7', borderWidth: 1, borderColor: '#E0E0E0', fontSize: 16 },
  // ستايلات شريط المقترحات الجديد
  quickSuggestionsContainer: { marginTop: 8, height: 40 },
  suggestionChip: { 
    backgroundColor: '#4F00D0', 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    justifyContent: 'center', 
    marginRight: 8,
    height: 34
  },
  suggestionChipText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  error: { color: 'red', fontSize: 12, marginTop: 4 },
  radioGroup: { flex: 1.5, flexDirection: 'row', gap: 6 },
  radioButton: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#E1E2E7', alignItems: 'center', justifyContent: 'center' },
  radioButtonSelected: { backgroundColor: '#4F00D0' },
  radioText: { fontSize: 13, fontWeight: '600', color: '#555' },
  radioTextSelected: { color: '#fff' },
  categoryTitle: { fontSize: 15, fontWeight: '600', color: '#1c1c1e', marginBottom: 10 },
  categoryScroll: { paddingBottom: 12 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 30, backgroundColor: '#E1E2E7', marginRight: 8 },
  categoryChipSelected: { backgroundColor: '#EDE7FF', borderColor: '#7C4DFF', borderWidth: 1.5 },
  categoryChipIcon: { fontSize: 15 },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  categoryChipTextSelected: { color: '#7C4DFF' },
  addButton: { backgroundColor: '#4F00D0', paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  addButtonDisabled: { backgroundColor: '#a38eff' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});