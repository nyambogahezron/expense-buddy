import { useState, useCallback } from 'react';
import { View, StyleSheet, Text, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactionStore } from '@/store/transactions';
import { CategoryFilter } from '@/components/CategoryFilter';
import { TransactionCategory } from '@/types/transaction';
import TransactionList from '@/components/transaction/TransactionList';
import EmptyState from '@/components/EmptyState';
import { design } from '@/constants/design';
import { router } from 'expo-router';

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, loadTransactions, isLoading } = useTransactionStore();
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filteredTransactions = selectedCategory
    ? transactions.filter((t) => t.category === selectedCategory)
    : transactions;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, [loadTransactions]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 20, 20) }]}>
      <View style={styles.header}>
        <Text style={styles.title}>All Expenses</Text>
      </View>

      <View style={styles.filterWrapper}>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </View>

      <View style={styles.listContainer}>
        {filteredTransactions.length === 0 && !isLoading ? (
          <EmptyState message="No transactions found." />
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            onTransactionPress={(id) => router.push(`/transactions/${id}`)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: design.colors.base,
  },
  header: {
    paddingHorizontal: design.spacing.lg,
    paddingBottom: design.spacing.sm,
  },
  title: {
    ...design.typography.h1,
    color: design.colors.text,
  },
  filterWrapper: {
    height: 60,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: design.spacing.lg,
    ...Platform.select({
      web: {
        maxWidth: 1200,
        marginHorizontal: 'auto',
        width: '100%',
      },
    }),
  }
});
