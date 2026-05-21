import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useBudgetStore } from '@/store/budgets';
import { Plus, TrendingUp, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useBudgetOverview } from '@/hooks/useBudgets';
import { formatCurrency, getBudgetStatus } from '@/utils/budgetHelpers';
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import * as budgetDb from '@/services/db/budgets';
import { Budget, BudgetCategory } from '@/types/budget';
import { design } from '@/constants/design';
import { AnimatedCard } from '@/components/ui/animated-card';
import { ProgressBar } from '@/components/ui/progress-bar';

export default function BudgetsScreen() {
  const { selectBudget } = useBudgetStore();
  const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overview = useBudgetOverview(allBudgets);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setError(null);
      const budgets = await budgetDb.getAllBudgets();
      setAllBudgets(budgets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
  };

  const handleBudgetPress = useCallback(
    (budget: Budget) => {
      selectBudget(budget);
      router.push(`/budgets/${budget.id}`);
    },
    [selectBudget]
  );

  const budgetCards = useMemo(() => {
    if (!allBudgets || allBudgets.length === 0) return [];

    return allBudgets.map((budget: Budget, index: number) => {
      const totalSpent =
        budget.categories?.reduce((sum: number, cat: BudgetCategory) => sum + (cat.spent || 0), 0) || 0;
      const progress = budget.totalAmount > 0 ? (totalSpent / budget.totalAmount) * 100 : 0;
      const status = getBudgetStatus(budget);

      return (
        <Animated.View key={budget.id} entering={FadeInUp.delay(index * 100).springify()}>
          <AnimatedCard
            style={styles.budgetCard}
            onPress={() => handleBudgetPress(budget)}
          >
            <View style={styles.budgetHeader}>
              <View style={styles.budgetTitleRow}>
                <Text style={styles.budgetName}>{budget.name}</Text>
                {status.status !== 'on-track' &&
                  (status.status === 'over-budget' ? (
                    <AlertTriangle size={18} color={design.colors.error} />
                  ) : (
                    <TrendingUp size={18} color={design.colors.warning} />
                  ))}
              </View>
              <Text style={styles.budgetAmount}>${budget.totalAmount.toLocaleString()}</Text>
            </View>

            <View style={styles.progressContainer}>
              <ProgressBar progress={progress} />
              <View style={styles.progressTextRow}>
                <Text style={styles.progressTextSpent}>${totalSpent.toLocaleString()} spent</Text>
                <Text style={styles.progressTextRemaining}>
                  ${Math.max(0, budget.totalAmount - totalSpent).toLocaleString()} left
                </Text>
              </View>
            </View>

            <View style={styles.categoriesGrid}>
              {budget.categories?.map((category: BudgetCategory) => (
                <View key={category.id} style={[styles.categoryChip, { backgroundColor: category.color + '20' }]}>
                  <Text style={[styles.categoryName, { color: category.color }]}>{category.name}</Text>
                </View>
              )) || []}
            </View>
          </AnimatedCard>
        </Animated.View>
      );
    });
  }, [allBudgets, handleBudgetPress]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Budgets',
          headerStyle: { backgroundColor: design.colors.base },
          headerTintColor: design.colors.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingRight: 16 }}>
              <ArrowLeft size={24} color={design.colors.text} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => router.push('/budgets/new')} style={styles.headerAddBtn}>
              <Plus size={20} color={design.colors.primary} />
            </Pressable>
          )
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={design.colors.primary} />}
      >
        {!isLoading && (!allBudgets || allBudgets.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No budgets found</Text>
            <Text style={styles.emptySubtitle}>Create your first budget to get started</Text>
            <Pressable onPress={() => router.push('/budgets/new')} style={styles.createBtn}>
              <Text style={styles.createBtnText}>Create Budget</Text>
            </Pressable>
          </View>
        )}

        {allBudgets.length > 0 && (
          <Animated.View entering={FadeInUp} style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>Overview</Text>
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewLabel}>Budgeted</Text>
                <Text style={[styles.overviewValue, { color: design.colors.text }]}>
                  {formatCurrency(overview.totalBudgeted)}
                </Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewLabel}>Spent</Text>
                <Text style={[styles.overviewValue, { color: design.colors.text }]}>
                  {formatCurrency(overview.totalSpent)}
                </Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewLabel}>Remaining</Text>
                <Text style={[styles.overviewValue, { color: overview.totalRemaining >= 0 ? design.colors.primary : design.colors.error }]}>
                  {formatCurrency(overview.totalRemaining)}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {budgetCards}
      </ScrollView>

      {allBudgets.length > 0 && (
        <Pressable onPress={() => router.push('/budgets/new')} style={styles.fab}>
          <Plus size={24} color="#FFF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: design.colors.base,
  },
  headerAddBtn: {
    padding: design.spacing.sm,
    backgroundColor: design.colors.primary + '20',
    borderRadius: design.borderRadius.pill,
  },
  content: {
    padding: design.spacing.lg,
    paddingBottom: 100,
    ...Platform.select({ web: { maxWidth: 800, marginHorizontal: 'auto', width: '100%' } }),
  },
  overviewCard: {
    backgroundColor: design.colors.surface,
    borderRadius: design.borderRadius.xl,
    padding: design.spacing.lg,
    marginBottom: design.spacing.xl,
    borderWidth: 1,
    borderColor: design.colors.border,
  },
  overviewTitle: {
    ...design.typography.h3,
    color: design.colors.text,
    marginBottom: design.spacing.md,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: design.colors.borderDark,
    borderRadius: design.borderRadius.lg,
    padding: design.spacing.md,
  },
  overviewStat: {
    alignItems: 'center',
    flex: 1,
  },
  overviewLabel: {
    ...design.typography.caption,
    color: design.colors.textSecondary,
    marginBottom: 4,
  },
  overviewValue: {
    ...design.typography.subtitle,
  },
  budgetCard: {
    marginBottom: design.spacing.lg,
    padding: design.spacing.lg,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: design.spacing.md,
  },
  budgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  budgetName: {
    ...design.typography.h3,
    color: design.colors.text,
  },
  budgetAmount: {
    ...design.typography.subtitle,
    color: design.colors.primary,
  },
  progressContainer: {
    marginBottom: design.spacing.md,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: design.spacing.sm,
  },
  progressTextSpent: {
    ...design.typography.caption,
    color: design.colors.textSecondary,
  },
  progressTextRemaining: {
    ...design.typography.caption,
    color: design.colors.text,
    fontFamily: 'Inter-Medium',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: design.spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: design.borderRadius.pill,
  },
  categoryName: {
    ...design.typography.caption,
    fontFamily: 'Inter-Medium',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: design.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: design.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    ...design.typography.h2,
    color: design.colors.text,
    marginBottom: design.spacing.sm,
  },
  emptySubtitle: {
    ...design.typography.body,
    color: design.colors.textSecondary,
    marginBottom: design.spacing.xl,
  },
  createBtn: {
    backgroundColor: design.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: design.borderRadius.pill,
  },
  createBtnText: {
    ...design.typography.subtitle,
    color: '#FFF',
  },
});
