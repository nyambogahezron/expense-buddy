import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '@/store/theme';
import {
	VictoryLine,
	VictoryChart,
	VictoryAxis,
	VictoryPie,
	VictoryBar,
} from 'victory-native';
import { DateRangePicker } from '@/components/DateRangePicker';
import Animated, { FadeInUp } from 'react-native-reanimated';
import MetricCard from '@/components/MetricCard';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import ContentWrapper from '@/components/ui/ContentWrapper';

// Custom chart theme
const customChartTheme = {
	axis: {
		style: {
			axis: {
				stroke: '#756f6a',
			},
			axisLabel: {
				fontSize: 16,
				padding: 30,
			},
			grid: {
				stroke: '#ECEFF1',
				strokeDasharray: '2, 2',
			},
			ticks: {
				stroke: '#756f6a',
				size: 5,
			},
			tickLabels: {
				fontSize: 12,
				padding: 5,
			},
		},
	},
	line: {
		style: {
			data: {
				stroke: '#252525',
			},
			labels: {
				fontSize: 12,
			},
		},
	},
	bar: {
		style: {
			data: {
				fill: '#252525',
			},
			labels: {
				fontSize: 12,
			},
		},
	},
	pie: {
		style: {
			data: {
				padding: 10,
			},
			labels: {
				fontSize: 12,
			},
		},
	},
};

const revenueData = [
	{ x: 'Jan', y: 13000 },
	{ x: 'Feb', y: 16500 },
	{ x: 'Mar', y: 14800 },
	{ x: 'Apr', y: 19000 },
	{ x: 'May', y: 18200 },
	{ x: 'Jun', y: 21500 },
];

const categoryData = [
	{ x: 'Food', y: 35 },
	{ x: 'Transport', y: 20 },
	{ x: 'Shopping', y: 25 },
	{ x: 'Bills', y: 20 },
];

const expenseData = [
	{ x: 'Jan', y: 8000 },
	{ x: 'Feb', y: 9500 },
	{ x: 'Mar', y: 8800 },
	{ x: 'Apr', y: 10000 },
	{ x: 'May', y: 9200 },
	{ x: 'Jun', y: 11500 },
];

export default function AnalyticsScreen() {
	const { theme } = useThemeStore();
	const [startDate] = useState(new Date(2024, 0, 1));
	const [endDate] = useState(new Date(2024, 5, 30));

	return (
		<ScrollView
			style={[styles.container, { backgroundColor: theme.colors.background }]}
			contentContainerStyle={styles.content}
		>
			<Stack.Screen
				options={{
					headerShown: true,
					header: () => (
						<View style={styles.header}>
							<ContentWrapper
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<Text style={[styles.title, { color: theme.colors.text }]}>
									Analytics
								</Text>
								<DateRangePicker
									startDate={startDate}
									endDate={endDate}
									onPress={() => {}}
								/>
							</ContentWrapper>
						</View>
					),
				}}
			/>

			<View style={styles.metricsGrid}>
				<MetricCard title='Total Revenue' value='21,500' change={12.5} />
				<MetricCard title='Total Expenses' value='11,500' change={-8.3} />
				<MetricCard title='Net Profit' value='10,000' change={15.7} />
			</View>

			<Animated.View
				entering={FadeInUp.delay(200)}
				style={[
					styles.chartContainer,
					{
						backgroundColor: theme.colors.surface,
						borderColor: theme.colors.border,
					},
				]}
			>
				<Text style={[styles.chartTitle, { color: theme.colors.text }]}>
					Revenue vs Expenses
				</Text>
				<VictoryChart
					theme={customChartTheme}
					height={250}
					padding={{ top: 20, bottom: 40, left: 60, right: 40 }}
				>
					<VictoryAxis
						tickFormat={(t) => t}
						style={{
							axis: { stroke: theme.colors.border },
							tickLabels: {
								fill: theme.colors.textSecondary,
								fontSize: 12,
								fontFamily: 'Inter-Regular',
							},
						}}
					/>
					<VictoryAxis
						dependentAxis
						tickFormat={(t) => `$${t / 1000}k`}
						style={{
							axis: { stroke: theme.colors.border },
							tickLabels: {
								fill: theme.colors.textSecondary,
								fontSize: 12,
								fontFamily: 'Inter-Regular',
							},
						}}
					/>
					<VictoryLine
						data={revenueData}
						style={{
							data: { stroke: theme.colors.success },
						}}
						animate={{
							duration: 2000,
							onLoad: { duration: 1000 },
						}}
					/>
					<VictoryLine
						data={expenseData}
						style={{
							data: { stroke: theme.colors.error },
						}}
						animate={{
							duration: 2000,
							onLoad: { duration: 1000 },
						}}
					/>
				</VictoryChart>
			</Animated.View>

			<View style={styles.chartsRow}>
				<Animated.View
					entering={FadeInUp.delay(400)}
					style={[
						styles.chartContainer,
						styles.halfChart,
						{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.border,
						},
					]}
				>
					<Text style={[styles.chartTitle, { color: theme.colors.text }]}>
						Expenses by Category
					</Text>
					<VictoryPie
						data={categoryData}
						colorScale={[
							theme.colors.primary,
							theme.colors.secondary,
							theme.colors.accent,
							theme.colors.error,
						]}
						height={200}
						animate={{
							duration: 2000,
							onLoad: { duration: 1000 },
						}}
						style={{
							labels: {
								fill: theme.colors.text,
								fontSize: 12,
								fontFamily: 'Inter-Regular',
							},
						}}
					/>
				</Animated.View>

				<Animated.View
					entering={FadeInUp.delay(600)}
					style={[
						styles.chartContainer,
						styles.halfChart,
						{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.border,
						},
					]}
				>
					<Text style={[styles.chartTitle, { color: theme.colors.text }]}>
						Monthly Growth
					</Text>
					<VictoryChart
						theme={customChartTheme}
						height={200}
						padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
					>
						<VictoryBar
							data={revenueData}
							style={{
								data: {
									fill: theme.colors.primary,
								},
							}}
							animate={{
								duration: 2000,
								onLoad: { duration: 1000 },
							}}
						/>
					</VictoryChart>
				</Animated.View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: 20,
		...(Platform.OS === 'web' && {
			maxWidth: 1200,
			marginHorizontal: 'auto',
			width: '100%',
		}),
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 50,
		paddingHorizontal: 10,
	},
	title: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
	},
	metricsGrid: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 20,
	},
	chartContainer: {
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 20,
	},
	chartTitle: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
		marginBottom: 12,
	},
	chartsRow: {
		flexDirection: 'column',
		gap: 12,
	},
	halfChart: {
		flex: 1,
	},
});
