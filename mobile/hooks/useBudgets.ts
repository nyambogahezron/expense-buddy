import { useEffect, useState, useMemo } from 'react';
import { useBudgetStore } from '@/store/budgets';
import { Budget } from '@/types/budget';
import {
	isBudgetActive,
	getRemainingDays,
	getBudgetStatus,
	getDailySpendingAllowance,
} from '@/utils/budgetHelpers';

/**
 * Hook to get budget with real-time calculations
 */
export const useBudgetWithStats = (budgetId: string | null) => {
	const { selectedBudget, getBudgetStats, budgetStats } = useBudgetStore();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (budgetId && (!budgetStats || budgetStats.budgetId !== budgetId)) {
			setLoading(true);
			getBudgetStats(budgetId).finally(() => setLoading(false));
		}
	}, [budgetId, getBudgetStats, budgetStats]);

	const budget = selectedBudget;
	const stats = budgetStats;

	const calculations = budget
		? {
				isActive: isBudgetActive(budget),
				remainingDays: getRemainingDays(budget),
				status: getBudgetStatus(budget),
				dailyAllowance: getDailySpendingAllowance(budget),
		  }
		: null;

	return {
		budget,
		stats,
		calculations,
		loading,
	};
};

/**
 * Hook to get active budgets
 */
export const useActiveBudgets = () => {
	const { budgets, getActiveBudgets, isLoading, error } = useBudgetStore();
	const [refreshing, setRefreshing] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);

	useEffect(() => {
		if (!hasInitialized && !isLoading) {
			setHasInitialized(true);
			getActiveBudgets();
		}
	}, [hasInitialized, isLoading, getActiveBudgets]);

	const refresh = async () => {
		setRefreshing(true);
		try {
			await getActiveBudgets();
		} finally {
			setRefreshing(false);
		}
	};

	const activeBudgets = budgets.filter(isBudgetActive);

	return {
		activeBudgets,
		allBudgets: budgets,
		isLoading,
		error,
		refreshing,
		refresh,
	};
};

/**
 * Hook for budget form validation
 */
export const useBudgetValidation = () => {
	const { checkBudgetNameExists } = useBudgetStore();
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});
	const [isValidating, setIsValidating] = useState(false);

	const validateBudgetName = async (
		name: string,
		excludeId?: string
	): Promise<boolean> => {
		if (!name.trim()) {
			setValidationErrors((prev) => ({
				...prev,
				name: 'Budget name is required',
			}));
			return false;
		}

		setIsValidating(true);
		try {
			const exists = await checkBudgetNameExists(name, excludeId);
			if (exists) {
				setValidationErrors((prev) => ({
					...prev,
					name: 'Budget name already exists',
				}));
				return false;
			} else {
				setValidationErrors((prev) => {
					const { name, ...rest } = prev;
					return rest;
				});
				return true;
			}
		} catch (error) {
			setValidationErrors((prev) => ({
				...prev,
				name: 'Error validating budget name',
			}));
			return false;
		} finally {
			setIsValidating(false);
		}
	};

	const validateAmount = (amount: string, field: string): boolean => {
		const numAmount = parseFloat(amount);
		if (isNaN(numAmount) || numAmount <= 0) {
			setValidationErrors((prev) => ({
				...prev,
				[field]: 'Amount must be greater than 0',
			}));
			return false;
		} else {
			setValidationErrors((prev) => {
				const { [field]: _, ...rest } = prev;
				return rest;
			});
			return true;
		}
	};

	const validateDates = (startDate: Date, endDate: Date): boolean => {
		if (endDate <= startDate) {
			setValidationErrors((prev) => ({
				...prev,
				endDate: 'End date must be after start date',
			}));
			return false;
		} else {
			setValidationErrors((prev) => {
				const { endDate, ...rest } = prev;
				return rest;
			});
			return true;
		}
	};

	const clearValidationError = (field: string) => {
		setValidationErrors((prev) => {
			const { [field]: _, ...rest } = prev;
			return rest;
		});
	};

	const clearAllErrors = () => {
		setValidationErrors({});
	};

	return {
		validationErrors,
		isValidating,
		validateBudgetName,
		validateAmount,
		validateDates,
		clearValidationError,
		clearAllErrors,
	};
};

/**
 * Hook for budget overview calculations
 */
export const useBudgetOverview = (budgets: Budget[]) => {
	return useMemo(() => {
		const activeBudgets = budgets.filter(isBudgetActive);

		const totalBudgeted = activeBudgets.reduce(
			(sum, budget) => sum + budget.totalAmount,
			0
		);
		const totalSpent = activeBudgets.reduce((sum, budget) => {
			return (
				sum + budget.categories.reduce((catSum, cat) => catSum + cat.spent, 0)
			);
		}, 0);
		const totalRemaining = totalBudgeted - totalSpent;

		const overBudgetCount = activeBudgets.filter((budget) => {
			const spent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0);
			return spent > budget.totalAmount;
		}).length;

		const warningCount = activeBudgets.filter((budget) => {
			const status = getBudgetStatus(budget);
			return status.status === 'warning';
		}).length;

		return {
			activeBudgetCount: activeBudgets.length,
			totalBudgeted,
			totalSpent,
			totalRemaining,
			overBudgetCount,
			warningCount,
			averageSpendingPercentage:
				totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
		};
	}, [budgets]);
};
