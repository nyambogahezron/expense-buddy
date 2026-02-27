import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { design } from '@/constants/design';

const revenueData = [ { x: 'Jan', y: 13000 }, { x: 'Feb', y: 16500 }, { x: 'Mar', y: 14800 }, { x: 'Apr', y: 19000 }, { x: 'May', y: 18200 }, { x: 'Jun', y: 21500 } ];
const categoryData = [ { x: 'Food', y: 35 }, { x: 'Transport', y: 20 }, { x: 'Shopping', y: 25 }, { x: 'Bills', y: 20 } ];
const expenseData = [ { x: 'Jan', y: 8000 }, { x: 'Feb', y: 9500 }, { x: 'Mar', y: 8800 }, { x: 'Apr', y: 10000 }, { x: 'May', y: 9200 }, { x: 'Jun', y: 11500 } ];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [startDate] = useState(new Date(2024, 0, 1));
  const [endDate] = useState(new Date(2024, 5, 30));

  const customChartTheme = useMemo(() => ({
    axis: {
      style: {
        axis: { stroke: design.colors.borderDark },
        grid: { stroke: design.colors.border, strokeDasharray: '4, 4' },
        ticks: { stroke: design.colors.borderDark, size: 5 },
        tickLabels: { fontSize: 12, padding: 5, fill: design.colors.textMuted, fontFamily: 'Inter-Regular' },
      },
    }
  }), []);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 20, 20) }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <DateRangePicker startDate={startDate} endDate={endDate} onPress={() => {}} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <MetricCard title='Total Revenue' value='21,500' change={12.5} />
          <MetricCard title='Total Expenses' value='11,500' change={-8.3} />
          <MetricCard title='Net Profit' value='10,000' change={15.7} />
        </View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Revenue vs Expenses</Text>
          <VictoryChart theme={customChartTheme as any} height={250} padding={{ top: 20, bottom: 40, left: 60, right: 40 }}>
            <VictoryAxis />
            <VictoryAxis dependentAxis tickFormat={(t) => `$${t / 1000}k`} />
            <VictoryLine
              data={revenueData}
              style={{ data: { stroke: design.colors.success, strokeWidth: 3 } }}
              animate={{ duration: 2000, onLoad: { duration: 1000 } }}
            />
            <VictoryLine
              data={expenseData}
              style={{ data: { stroke: design.colors.error, strokeWidth: 3 } }}
              animate={{ duration: 2000, onLoad: { duration: 1000 } }}
            />
          </VictoryChart>
        </Animated.View>

        <View style={styles.chartsRow}>
          <Animated.View entering={FadeInUp.delay(300)} style={[styles.chartContainer, styles.halfChart]}>
            <Text style={styles.chartTitle}>By Category</Text>
            <VictoryPie
              data={categoryData}
              colorScale={[design.colors.primary, design.colors.secondary, '#F59E0B', '#EC4899']}
              height={200}
              padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
              style={{ labels: { fill: design.colors.text, fontSize: 12, fontFamily: 'Inter-Medium' } }}
              animate={{ duration: 2000, onLoad: { duration: 1000 } }}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)} style={[styles.chartContainer, styles.halfChart]}>
            <Text style={styles.chartTitle}>Monthly Growth</Text>
            <VictoryChart theme={customChartTheme as any} height={200} padding={{ top: 20, bottom: 40, left: 40, right: 20 }}>
              <VictoryAxis />
              <VictoryAxis dependentAxis tickFormat={(t) => `${t / 1000}k`} />
              <VictoryBar
                data={revenueData}
                style={{ data: { fill: design.colors.primary, width: 12 } }}
                cornerRadius={{ top: 4 }}
                animate={{ duration: 2000, onLoad: { duration: 1000 } }}
              />
            </VictoryChart>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: design.colors.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: design.spacing.lg,
    paddingBottom: design.spacing.lg,
  },
  title: {
    ...design.typography.h1,
    color: design.colors.text,
  },
  content: {
    padding: design.spacing.lg,
    paddingTop: 0,
    ...Platform.select({ web: { maxWidth: 1200, marginHorizontal: 'auto', width: '100%' } }),
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: design.spacing.md,
    marginBottom: design.spacing.xl,
  },
  chartContainer: {
    padding: design.spacing.lg,
    borderRadius: design.borderRadius.xl,
    backgroundColor: design.colors.surface,
    borderWidth: 1,
    borderColor: design.colors.border,
    marginBottom: design.spacing.lg,
  },
  chartTitle: {
    ...design.typography.h3,
    color: design.colors.text,
    marginBottom: design.spacing.md,
  },
  chartsRow: {
    flexDirection: 'column',
    gap: design.spacing.lg,
  },
  halfChart: {
    flex: 1,
    alignItems: 'center',
  },
});
