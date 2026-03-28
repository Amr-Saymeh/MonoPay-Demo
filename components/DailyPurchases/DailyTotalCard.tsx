import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert ,
  I18nManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ref, onValue } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@/src/firebaseConfig';
import { useI18n } from "@/hooks/use-i18n"; 

const THEME = {
  primary: '#7C4DFF',
  primaryLight: '#a77ffdff',
  tertiary: '#00C853',
};

const STORAGE_KEY = '@daily_budget';

export default function DailyTotalCard() {
  const { t } = useI18n(); // نستخدم t فقط كما طلبت
  const isRtl = I18nManager.isRTL;
  const [totalSpent, setTotalSpent] = useState(0);
  const [dailyBudget, setDailyBudget] = useState(250);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempBudget, setTempBudget] = useState('');

  useEffect(() => {
    const loadBudget = async () => {
      try {
        const savedBudget = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedBudget) setDailyBudget(parseFloat(savedBudget));
      } catch (e) { console.log('Failed to load budget'); }
    };
    loadBudget();
  }, []);

  useEffect(() => {
    const purchasesRef = ref(db, 'purchases');
    const unsubscribe = onValue(purchasesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setTotalSpent(0);
        setLoading(false);
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      let total = 0;
      snapshot.forEach((child) => {
        const val = child.val();
        const itemDate = val.createdAt ? val.createdAt.split('T')[0] : null;
        if (itemDate === today) total += val.amount || 0;
      });
      setTotalSpent(total);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const budgetPercent = dailyBudget > 0 
    ? Math.min(Math.round((totalSpent / dailyBudget) * 100), 100) 
    : 0;

  const saveBudget = async () => {
    const newBudget = parseFloat(tempBudget);
    if (isNaN(newBudget) || newBudget <= 0) {
      // رسالة خطأ عامة من ملف الترجمة
      Alert.alert(t('error'), t('invalidAmount')); 
      return;
    }
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newBudget.toString());
      setDailyBudget(newBudget);
      setModalVisible(false);
      setTempBudget('');
    } catch (e) { Alert.alert(t('error'), t('uploadFailed')); }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[THEME.primaryLight, THEME.primary, '#5C2ECC']}
        start={{ x: 1, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* الدوائر الخلفية تبقى ثابتة جمالياً */}
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />

        {/* alignItems: 'flex-start' في React Native تتبع لغة الجهاز تلقائياً إذا كان التطبيق مهيأ */}
        <View style={styles.content}>
          <Text style={styles.label}>{t('totalExpenses')}</Text>
          <Text style={styles.amount}>
            {loading ? '...' : `₪${totalSpent.toFixed(2)}`}
          </Text>

          {budgetPercent > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {budgetPercent}% {t('ofDailyBudget')}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              setTempBudget(dailyBudget.toString());
              setModalVisible(true);
            }}
          >
            <Text style={styles.editButtonText}>
              {t('editDailyBudget')} ({dailyBudget} ₪)
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('dailyBudget')}</Text>
            <Text style={styles.modalSubtitle}>{t('setDailyLimit')}</Text>

            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={tempBudget}
              onChangeText={setTempBudget}
              placeholder="250"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={saveBudget}>
                <Text style={styles.saveText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginVertical: 12, borderRadius: 40, overflow: 'hidden', elevation: 8 },
  gradient: { minHeight: 220, borderRadius: 40, position: 'relative' },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    paddingHorizontal: 30, 
    paddingVertical: 30, 
    zIndex: 3,
    // لجعل النصوص تبدأ من جهة البداية (يسار في EN، يمين في AR)
    alignItems: 'flex-start' 
  },
  circleTopRight: { position: 'absolute', top: -60, right: -43, width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255, 255, 255, 0.04)' },
  circleBottomLeft: { position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255, 255, 255, 0.04)' },
  label: { fontSize: 16, fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  amount: { fontSize: 42, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
  badge: { 
    alignSelf: 'flex-start', 
    backgroundColor: THEME.tertiary, 
    borderRadius: 20, 
    paddingVertical: 6, 
    paddingHorizontal: 16,
    flexDirection: 'row' // يضمن ترتيب النسبة المئوية والنص بشكل صحيح
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#000', textTransform: 'uppercase' },
  editButton: { marginTop: 15, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  editButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '85%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  modalInput: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, fontSize: 18, marginBottom: 20, textAlign: 'center' },
  modalButtons: { 
    flexDirection: 'row', // سيعتمد على اتجاه النظام
    gap: 12, 
    width: '100%' 
  },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center' },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#7C4DFF', alignItems: 'center' },
  cancelText: { color: '#333', fontWeight: '600' },
  saveText: { color: '#fff', fontWeight: '600' },
});