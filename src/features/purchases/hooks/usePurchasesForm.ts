import { useState, useEffect, useMemo } from 'react';
import { Keyboard } from 'react-native';
import { useForm } from 'react-hook-form';
import { ref, push, set, onValue } from 'firebase/database';
import { db } from '@/src/firebaseConfig';
import { FormValues, Currency } from '../types';

export function usePurchasesForm(onSuccessAction?: () => void, onErrorAction?: () => void) {
  const [visibleToast, setVisibleToast] = useState(false);
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
  const selectedCurrency = watch('currency') as Currency;

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'purchases'), (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }
      const data = snapshot.val();
      const names = Object.values(data)
        .map((item: any) => item.title)
        .filter(title => title && typeof title === 'string');
      setAllPastPurchases(Array.from(new Set(names)) as string[]);
    });
    return () => unsubscribe();
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!nameInput || typeof nameInput !== 'string' || nameInput.trim() === '') return [];
    return allPastPurchases.filter(n =>
      n.toLowerCase().includes(nameInput.toLowerCase()) && n !== nameInput
    ).slice(0, 6);
  }, [nameInput, allPastPurchases]);

  const onSubmit = async (data: FormValues) => {
    if (!data.name.trim() || !data.cost) {
      if (onErrorAction) onErrorAction();
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

      setVisibleToast(true);
      setTimeout(() => setVisibleToast(false), 1500);

      reset();
      Keyboard.dismiss();
      if (onSuccessAction) onSuccessAction();
    } catch (e) {
      console.error(e);
      if (onErrorAction) onErrorAction();
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    errors,
    setValue,
    selectedCurrency,
    loading,
    visibleToast,
    suggestions: filteredSuggestions,
    onSubmit: handleSubmit(onSubmit),
  };
}
