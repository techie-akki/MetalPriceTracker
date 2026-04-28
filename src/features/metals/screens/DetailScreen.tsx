import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import HistoryChart from '../components/HistoryChart';
import {useMetalHistory} from '../hooks/useMetalHistory';
import {useMetal} from '../hooks/useMetal';
import {MetalHistoryRange, RootStackParamList} from '../types';
import {useTheme} from '../../../shared/theme/ThemeContext';
import {
  formatNumber,
  formatPercent,
  formatTimestamp,
  formatUsd,
  formatUsdCompact,
} from '../utils';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const HISTORY_RANGE_OPTIONS: Array<{
  description: string;
  key: MetalHistoryRange;
  label: string;
}> = [
  {key: 'today', label: 'Today', description: 'Intraday hourly points'},
  {key: 'yesterday', label: 'Yesterday', description: 'Previous trading day'},
  {key: '2d', label: '2 Days', description: 'Latest 48 hours'},
];

const MetricCard = ({
  label,
  theme,
  value,
}: {
  label: string;
  theme: ReturnType<typeof useTheme>['theme'];
  value: string;
}) => (
  <View
    style={[
      styles.metricCard,
      {
        backgroundColor: theme.colors.panel,
        borderColor: theme.colors.cardBorder,
      },
    ]}>
    <Text style={[styles.metricLabel, {color: theme.colors.secondaryText}]}>
      {label}
    </Text>
    <Text style={[styles.metricValue, {color: theme.colors.primaryText}]}>
      {value}
    </Text>
  </View>
);

export default function DetailScreen({route}: Props) {
  const {metal, initialData} = route.params;
  const {theme} = useTheme();
  const [selectedRange, setSelectedRange] =
    React.useState<MetalHistoryRange>('today');
  const [historyEnabled, setHistoryEnabled] = React.useState(false);
  const isLightMode = theme.mode === 'light';
  const heroColors = isLightMode
    ? [
        metal.gradient[0].replace(/0\.\d+\)/, '0.22)'),
        'rgba(255,255,255,0.96)',
        'rgba(226,232,240,0.96)',
      ]
    : metal.gradient;
  const heroBorderColor = isLightMode
    ? 'rgba(15,23,42,0.10)'
    : 'rgba(255,255,255,0.14)';
  const heroTitleColor = isLightMode ? '#10213A' : '#FFFFFF';
  const heroSecondaryColor = isLightMode
    ? 'rgba(16,33,58,0.72)'
    : 'rgba(255,255,255,0.76)';
  const heroTimestampColor = isLightMode
    ? 'rgba(16,33,58,0.68)'
    : 'rgba(255,255,255,0.76)';
  const heroButtonBackground = isLightMode
    ? 'rgba(255,255,255,0.88)'
    : 'rgba(255,255,255,0.14)';
  const heroButtonBorderColor = isLightMode
    ? 'rgba(15,23,42,0.10)'
    : 'rgba(255,255,255,0.18)';
  const heroButtonTextColor = isLightMode ? '#10213A' : '#FFFFFF';
  const {data, error, isError, isFetching, isLoading, refetch} = useMetal(
    metal.symbol,
    {
      enabled: false,
      initialData,
      refetchOnMount: false,
      staleTime: 1000 * 60 * 60 * 8,
    },
  );
  const historyQuery = useMetalHistory(metal.symbol, selectedRange, {
    enabled: historyEnabled,
  });

  if (isLoading && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.colors.background}]}>
        <View style={[styles.fullScreen, {backgroundColor: theme.colors.background}]}>
          <View style={styles.centered}>
            <ActivityIndicator color={metal.accent} size="large" />
            <Text style={[styles.centerText, {color: theme.colors.secondaryText}]}>
              Loading {metal.name} details...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.colors.background}]}>
        <View style={[styles.fullScreen, {backgroundColor: theme.colors.background}]}>
          <View style={styles.centered}>
            <Text style={[styles.errorTitle, {color: theme.colors.primaryText}]}>
              Unable to load {metal.name}
            </Text>
            <Text style={[styles.errorMessage, {color: theme.colors.secondaryText}]}>
              {error instanceof Error ? error.message : 'Please try again shortly.'}
            </Text>
            <Pressable
              onPress={() => refetch()}
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.panel,
                  borderColor: theme.colors.cardBorder,
                },
              ]}>
              <Text style={[styles.actionButtonText, {color: theme.colors.primaryText}]}>
                Refresh live quote
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={heroColors}
          style={[styles.hero, {borderColor: heroBorderColor}]}>
          <Text style={[styles.heroName, {color: heroTitleColor}]}>{metal.name}</Text>
          <Text style={[styles.heroSymbol, {color: heroSecondaryColor}]}>
            {metal.symbol} / USD
          </Text>
          <Text style={[styles.heroPrice, {color: heroTitleColor}]}>
            {formatUsd(data.price)}
          </Text>
          <Text
            style={[
              styles.heroChange,
              data.ch >= 0 ? styles.positiveChange : styles.negativeChange,
            ]}>
            {`${data.ch >= 0 ? '+' : ''}${formatNumber(data.ch)} (${formatPercent(
              data.chp,
            )})`}
          </Text>
          <Text style={[styles.timestamp, {color: heroTimestampColor}]}>
            {data.isFallback
              ? 'Showing sample data until a live refresh is used'
              : `Last updated ${formatTimestamp(data.timestamp)}`}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[
              styles.heroActionButton,
              {
                backgroundColor: heroButtonBackground,
                borderColor: heroButtonBorderColor,
              },
            ]}>
            <Text style={[styles.heroActionButtonText, {color: heroButtonTextColor}]}>
              {isFetching ? 'Refreshing...' : 'Refresh live quote'}
            </Text>
          </Pressable>
          {isFetching ? (
            <ActivityIndicator
              color={isLightMode ? heroButtonTextColor : '#FFFFFF'}
              style={styles.heroLoader}
            />
          ) : null}
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.primaryText}]}>
            Market Snapshot
          </Text>
          <View style={styles.grid}>
            <MetricCard
              label="24K / gram"
              theme={theme}
              value={formatUsdCompact(data.price_gram_24k)}
            />
            <MetricCard
              label="Estimated open"
              theme={theme}
              value={formatUsd(data.open_price)}
            />
            <MetricCard
              label="Estimated previous close"
              theme={theme}
              value={formatUsd(data.prev_close_price)}
            />
            <MetricCard
              label="Estimated day low"
              theme={theme}
              value={formatUsd(data.low_price)}
            />
            <MetricCard
              label="Estimated day high"
              theme={theme}
              value={formatUsd(data.high_price)}
            />
            <MetricCard
              label="Spread bid"
              theme={theme}
              value={formatUsd(data.bid)}
            />
            <MetricCard
              label="Spread ask"
              theme={theme}
              value={formatUsd(data.ask)}
            />
            <MetricCard
              label="Exchange"
              theme={theme}
              value={data.exchange || '--'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: theme.colors.primaryText}]}>
              Price Trend
            </Text>
            <Text style={[styles.sectionCaption, {color: theme.colors.secondaryText}]}>
              {
                HISTORY_RANGE_OPTIONS.find(option => option.key === selectedRange)
                  ?.description
              }
            </Text>
          </View>
          <View
            style={[
              styles.segmentedControl,
              {
                backgroundColor: theme.colors.panel,
                borderColor: theme.colors.cardBorder,
              },
            ]}>
            {HISTORY_RANGE_OPTIONS.map(option => {
              const isSelected = option.key === selectedRange;

              return (
                <Pressable
                  key={option.key}
                  onPress={() => setSelectedRange(option.key)}
                  style={[
                    styles.segmentButton,
                    isSelected && styles.segmentButtonActive,
                    isSelected && {backgroundColor: theme.colors.cardBorder},
                  ]}>
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: isSelected
                          ? theme.colors.primaryText
                          : theme.colors.secondaryText,
                      },
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View
            style={[
              styles.chartPanel,
              {
                backgroundColor: theme.colors.panel,
                borderColor: theme.colors.cardBorder,
              },
            ]}>
            {!historyEnabled ? (
              <>
                <Text style={[styles.chartMeta, {color: theme.colors.secondaryText}]}>
                  Load live hourly history when you want it. Each history request
                  uses 1 live budget slot.
                </Text>
                <Pressable
                  onPress={() => setHistoryEnabled(true)}
                  style={[
                    styles.historyActionButton,
                    {
                      backgroundColor: theme.colors.panel,
                      borderColor: theme.colors.cardBorder,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.historyActionButtonText,
                      {color: theme.colors.primaryText},
                    ]}>
                    Load live history
                  </Text>
                </Pressable>
              </>
            ) : historyQuery.isLoading ? (
              <ActivityIndicator color={metal.accent} />
            ) : historyQuery.data && historyQuery.data.length > 1 ? (
              <>
                <HistoryChart
                  accentColor={data.ch >= 0 ? '#67E8A3' : '#FF9B9B'}
                  label={`${metal.name} Price`}
                  points={historyQuery.data}
                  rangeLabel={
                    HISTORY_RANGE_OPTIONS.find(option => option.key === selectedRange)
                      ?.label ?? selectedRange
                  }
                  theme={theme}
                />
                <Text style={[styles.chartMeta, {color: theme.colors.secondaryText}]}>
                  {historyQuery.data.length} points loaded for {selectedRange}
                </Text>
              </>
            ) : historyQuery.isError ? (
              <Text style={[styles.chartMeta, {color: theme.colors.secondaryText}]}>
                {historyQuery.error instanceof Error
                  ? historyQuery.error.message
                  : 'Historical data is unavailable for this range right now.'}
              </Text>
            ) : (
              <Text style={[styles.chartMeta, {color: theme.colors.secondaryText}]}>
                Historical intraday data is unavailable for this metal right now.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.primaryText}]}>
            Feed Metadata
          </Text>
          <View
            style={[
              styles.infoPanel,
              {
                backgroundColor: theme.colors.panel,
                borderColor: theme.colors.cardBorder,
              },
            ]}>
            <Text style={[styles.infoRow, {color: theme.colors.secondaryText}]}>
              Quote fields:{' '}
              <Text style={[styles.infoValue, {color: theme.colors.primaryText}]}>
                Live spot price from MetalpriceAPI. Open, previous close, high,
                and low are app-side estimates.
              </Text>
            </Text>
            <Text style={[styles.infoRow, {color: theme.colors.secondaryText}]}>
              Open timestamp:{' '}
              <Text style={[styles.infoValue, {color: theme.colors.primaryText}]}>
                {formatTimestamp(data.open_time)}
              </Text>
            </Text>
            <Text style={[styles.infoRow, {color: theme.colors.secondaryText}]}>
              Quote timestamp:{' '}
              <Text style={[styles.infoValue, {color: theme.colors.primaryText}]}>
                {formatTimestamp(data.timestamp)}
              </Text>
            </Text>
            <Text style={[styles.infoRow, {color: theme.colors.secondaryText}]}>
              Currency:{' '}
              <Text style={[styles.infoValue, {color: theme.colors.primaryText}]}>
                {data.currency}
              </Text>
            </Text>
            <Text style={[styles.infoRow, {color: theme.colors.secondaryText}]}>
              Provider symbol:{' '}
              <Text style={[styles.infoValue, {color: theme.colors.primaryText}]}>
                {data.symbol}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fullScreen: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  centerText: {
    color: '#D5DCEC',
    marginTop: 14,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  hero: {
    borderRadius: 30,
    borderWidth: 1,
    minHeight: 328,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '800',
  },
  heroSymbol: {
    fontSize: 14,
    marginTop: 4,
  },
  heroPrice: {
    fontSize: 40,
    fontWeight: '800',
    marginTop: 20,
  },
  heroChange: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  positiveChange: {
    color: '#67E8A3',
  },
  negativeChange: {
    color: '#FF9B9B',
  },
  timestamp: {
    fontSize: 13,
    marginTop: 12,
  },
  heroActionButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroActionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  heroLoader: {
    marginTop: 14,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionCaption: {
    color: '#9FAEC8',
    fontSize: 13,
    marginTop: 4,
  },
  segmentedControl: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentButtonActive: {
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 96,
    padding: 16,
    width: '48%',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoPanel: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  chartPanel: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 150,
    padding: 18,
  },
  chartMeta: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  historyActionButton: {
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  historyActionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoRow: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  infoValue: {},
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  errorMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  actionButtonText: {
    fontWeight: '700',
  },
});
