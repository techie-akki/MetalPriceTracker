import React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {AppTheme} from '../../../shared/theme/ThemeContext';
import {MetalHistoryPoint} from '../types';
import {formatUsdCompact} from '../utils';

interface HistoryChartProps {
  accentColor: string;
  label: string;
  points: MetalHistoryPoint[];
  rangeLabel: string;
  theme: AppTheme;
}

const CHART_WIDTH = Dimensions.get('window').width - 88;

const makeLabels = (points: MetalHistoryPoint[]) => {
  return points.map((point, index) => {
    const date = new Date(point.timestamp * 1000);
    const isFirst = index === 0;
    const isMiddle = index === Math.floor(points.length / 2);
    const isLast = index === points.length - 1;

    if (!(isFirst || isMiddle || isLast)) {
      return '';
    }

    if (points.length > 24) {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      });
    }

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
    });
  });
};

export default function HistoryChart({
  accentColor,
  label,
  points,
  rangeLabel,
  theme,
}: HistoryChartProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, {color: theme.colors.primaryText}]}>{label}</Text>
        <Text style={[styles.rangeLabel, {color: theme.colors.secondaryText}]}>
          {rangeLabel}
        </Text>
      </View>
      <LineChart
        bezier
        data={{
          datasets: [
            {
              color: () => accentColor,
              data: points.map(point => point.price),
              strokeWidth: 3,
            },
          ],
          labels: makeLabels(points),
        }}
        chartConfig={{
          backgroundGradientFrom: 'transparent',
          backgroundGradientTo: 'transparent',
          color: () => accentColor,
          decimalPlaces: 2,
          formatYLabel: value => formatUsdCompact(Number(value)),
          labelColor: () => theme.colors.secondaryText,
          propsForBackgroundLines: {
            stroke: theme.colors.cardBorder,
            strokeDasharray: '',
          },
          propsForDots: {
            fill: accentColor,
            r: '3',
            stroke: theme.colors.background,
            strokeWidth: '1',
          },
          propsForLabels: {
            fontSize: 11,
          },
          propsForVerticalLabels: {
            translateX: -6,
          },
          propsForHorizontalLabels: {
            translateY: -2,
          },
          strokeWidth: 3,
        }}
        fromZero={false}
        height={220}
        segments={4}
        style={styles.chart}
        transparent
        width={CHART_WIDTH}
        withHorizontalLabels
        withInnerLines
        withOuterLines={false}
        withShadow={false}
        withVerticalLines={false}
      />
      <View style={styles.footer}>
        <Text style={[styles.axisLabel, {color: theme.colors.secondaryText}]}>
          Y: USD price
        </Text>
        <Text style={[styles.axisLabel, {color: theme.colors.secondaryText}]}>
          X: time
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  rangeLabel: {
    fontSize: 12,
  },
  chart: {
    borderRadius: 16,
    marginLeft: -16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  axisLabel: {
    fontSize: 12,
  },
});
