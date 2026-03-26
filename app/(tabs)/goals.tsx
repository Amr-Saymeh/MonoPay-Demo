// app/(tabs)/goals.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { GoalCard } from '@/components/goals/GoalCard';
import { ContributionModal } from '@/components/goals/ContributionModal';
import { useAuthSession } from '@/hooks/use-auth';
import { useI18n } from '@/hooks/use-i18n';
import { app } from '@/src/firebaseConfig';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, update, child, set } from 'firebase/database';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GoalsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { user } = useAuthSession();
  const [goals, setGoals] = useState<any[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [currencies, setCurrencies] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (!user) return;
    
    const db = getDatabase(app);
    const goalsRef = ref(db, 'wallets');
    const goalsQuery = query(goalsRef, orderByChild('type'), equalTo('shared'));
    
    const unsubscribe = onValue(goalsQuery, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setGoals([]);
        setTotalSaved(0);
        return;
      }
      
      const userGoals = Object.entries(data)
        .filter(([key, goal]: [string, any]) => 
          goal.members && goal.members[user.uid]
        )
        .map(([key, goal]: [string, any]) => ({
          id: key,
          ...goal
        }));
      
      setGoals(userGoals);
      
      // Calculate total saved
      const total = userGoals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
      setTotalSaved(total);
      
      // Get currencies totals
      const currencyTotals: {[key: string]: number} = {};
      userGoals.forEach(goal => {
        const currency = goal.goalTargetCurrency?.toLowerCase() || 'usd';
        currencyTotals[currency] = (currencyTotals[currency] || 0) + (goal.currentAmount || 0);
      });
      setCurrencies(currencyTotals);
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleContribute = (goal: any) => {
    setSelectedGoal(goal);
    setShowContributionModal(true);
  };

  const handleContributionSubmit = async (amount: number, reason?: string) => {
    if (!selectedGoal || !user) return;
    
    try {
      const db = getDatabase(app);
      const goalRef = ref(db, `wallets/${selectedGoal.id}`);
      
      // Update current amount
      const newAmount = (selectedGoal.currentAmount || 0) + amount;
      
      await update(goalRef, {
        currentAmount: newAmount
      });
      
      // Add to shared logs
      const logsRef = child(goalRef, 'sharedLogs');
      const newLogRef = child(logsRef, Date.now().toString());
      await set(newLogRef, {
        amount,
        currency: selectedGoal.goalTargetCurrency,
        reason,
        userUid: user.uid,
        createdAt: Date.now()
      });
      
      // Update currencies
      const currencyRef = child(goalRef, `currencies/${selectedGoal.goalTargetCurrency.toLowerCase()}`);
      await set(currencyRef, (selectedGoal.currentAmount || 0) + amount);
      
      console.log(t('goals.contributionSuccess'));
    } catch (error) {
      console.error('Contribution error:', error);
    }
  };

  const handleEdit = (goal: any) => {
    router.push({
      pathname: './(tabs)/goals/create',
      params: { 
        id: goal.id,
        edit: 'true',
        ...goal
      }
    });
  };

  const handleDelete = async (goalId: string) => {
    try {
      const db = getDatabase(app);
      const goalRef = ref(db, `wallets/${goalId}`);
      await set(goalRef, null);
      console.log(t('goals.deleteSuccess'));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const calculateOverallProgress = () => {
    if (goals.length === 0) return 0;
    
    const totalTarget = goals.reduce((sum, goal) => sum + (goal.goalTargetAmount || 0), 0);
    return totalTarget > 0 ? totalSaved / totalTarget : 0;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t('goals.title')}</ThemedText>
          <Pressable 
            style={styles.addButton}
            onPress={() => router.push('./(tabs)/goals/create')}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
        
        <ScrollView style={styles.content}>
          {/* Total Saved Card */}
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.summaryTitle}>{t('goals.totalSaved')}</ThemedText>
            <ThemedText style={styles.summaryAmount}>
              {formatCurrency(totalSaved, 'USD')}
            </ThemedText>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${calculateOverallProgress() * 100}%` }
                  ]} 
                />
              </View>
            </View>
            <View style={styles.currencySummary}>
              {Object.entries(currencies).map(([currency, amount]) => (
                <ThemedText key={currency} style={styles.currencyItem}>
                  {formatCurrency(amount, currency)}
                </ThemedText>
              ))}
            </View>
          </ThemedView>
          
          {/* Goals List */}
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              id={goal.id}
              title={goal.goal}
              currentAmount={goal.currentAmount || 0}
              targetAmount={goal.goalTargetAmount}
              targetCurrency={goal.goalTargetCurrency}
              targetDate={goal.goalTargetDate}
              onContribute={() => handleContribute(goal)}
              onEdit={() => handleEdit(goal)}
              onDelete={() => handleDelete(goal.id)}
            />
          ))}
        </ScrollView>
        
        <ContributionModal
          visible={showContributionModal}
          onClose={() => {
            setShowContributionModal(false);
            setSelectedGoal(null);
          }}
          onSubmit={handleContributionSubmit}
          currency={selectedGoal?.goalTargetCurrency || 'usd'}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  currencySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currencyItem: {
    color: '#EDE9FE',
    fontSize: 14,
  },
});
