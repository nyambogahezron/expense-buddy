import { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { design } from '@/constants/design';
import { useTransactionStore } from '@/store/transactions';
import { AnimatedCard } from '@/components/ui/animated-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import TransactionList from '@/components/transaction/TransactionList';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { transactions, loadTransactions, isLoading } = useTransactionStore();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 20, 20) }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Overview</Text>
      </View>

      <AnimatedCard style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>${summary.balance.toFixed(2)}</Text>
        
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <View style={[styles.metricIcon, { backgroundColor: design.colors.successBg }]}>
              <ArrowDownRight size={16} color={design.colors.success} />
            </View>
            <View>
              <Text style={styles.metricLabel}>Income</Text>
              <Text style={styles.metricValue}>${summary.income.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.metric}>
            <View style={[styles.metricIcon, { backgroundColor: design.colors.errorBg }]}>
              <ArrowUpRight size={16} color={design.colors.error} />
            </View>
            <View>
              <Text style={styles.metricLabel}>Expenses</Text>
              <Text style={styles.metricValue}>${summary.expense.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </AnimatedCard>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <AnimatedButton 
          title="Income" 
          variant="secondary"
          size="sm"
          leftIcon={<ArrowDownRight size={18} color={design.colors.success} />}
          onPress={() => router.push('/transactions/new?type=income' as any)}
          style={styles.actionButton}
        />
        <AnimatedButton 
          title="Expense" 
          variant="secondary"
          size="sm"
          leftIcon={<ArrowUpRight size={18} color={design.colors.error} />}
          onPress={() => router.push('/transactions/new?type=expense' as any)}
          style={styles.actionButton}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitleWithoutMargin}>Recent Transactions</Text>
        <Text style={styles.seeAll} onPress={() => router.push('/expenses')}>See All</Text>
      </View>

      {recentTransactions.length > 0 ? (
        <TransactionList 
          transactions={recentTransactions} 
          onTransactionPress={(id) => router.push(`/transactions/${id}`)}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No recent transactions</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: design.colors.base,
  },
  content: {
    paddingHorizontal: design.spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: design.spacing.lg,
  },
  greeting: {
    ...design.typography.h1,
    color: design.colors.text,
  },
  balanceCard: {
    backgroundColor: design.colors.surface,
    padding: design.spacing.xl,
    marginBottom: design.spacing.xl,
    borderWidth: 1,
    borderColor: design.colors.border,
  },
  balanceLabel: {
    ...design.typography.subtitle,
    color: design.colors.textSecondary,
    marginBottom: design.spacing.xs,
  },
  balanceAmount: {
    fontSize: 40,
    fontFamily: 'Inter-Bold',
    color: design.colors.text,
    marginBottom: design.spacing.xl,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: design.spacing.md,
    borderTopWidth: 1,
    borderTopColor: design.colors.border,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: design.spacing.sm,
  },
  metricIcon: {
    padding: 8,
    borderRadius: design.borderRadius.pill,
  },
  metricLabel: {
    ...design.typography.caption,
    color: design.colors.textSecondary,
  },
  metricValue: {
    ...design.typography.subtitle,
    color: design.colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: design.spacing.md,
    marginTop: design.spacing.lg,
  },
  sectionTitle: {
    ...design.typography.h3,
    color: design.colors.text,
    marginBottom: design.spacing.md,
  },
  sectionTitleWithoutMargin: {
    ...design.typography.h3,
    color: design.colors.text,
  },
  seeAll: {
    ...design.typography.body,
    color: design.colors.primary,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: design.spacing.md,
    marginBottom: design.spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    padding: design.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: design.colors.surface,
    borderRadius: design.borderRadius.lg,
  },
  emptyText: {
    ...design.typography.body,
    color: design.colors.textSecondary,
  }
});
