import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import SkeletonTile from '../../../shared/components/SkeletonTile';
import {useTheme} from '../../../shared/theme/ThemeContext';
import {useMetal} from '../hooks/useMetal';
import {MetalDefinition, MetalQuote} from '../types';
import {
  formatNumber,
  formatPercent,
  formatTimestamp,
  formatUsd,
  formatUsdCompact,
} from '../utils';
import Sparkline from './Sparkline';

interface MetalTileProps {
  metal: MetalDefinition;
  onPress: (metal: MetalDefinition, data: MetalQuote) => void;
  refreshPulse?: number;
}

const TILE_SPINNER_TIMEOUT_MS = 1500;

export default function MetalTile({
  metal,
  onPress,
  refreshPulse = 0,
}: MetalTileProps) {
  const {theme} = useTheme();
  const {data, error, isError, isLoading, refetch} = useMetal(
    metal.symbol,
    {enabled: false},
  );
  const [showRefreshing, setShowRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (refreshPulse === 0) {
      return;
    }

    setShowRefreshing(true);
    const timer = setTimeout(() => {
      setShowRefreshing(false);
    }, TILE_SPINNER_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [refreshPulse]);

  if (isLoading) {
    return <SkeletonTile accent={metal.accent} />;
  }

  if (isError || !data) {
    return (
      <LinearGradient colors={metal.gradient} style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{metal.name}</Text>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Unable to load this price.'}
        </Text>
        <Pressable onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </LinearGradient>
    );
  }

  const isPositive = data.ch >= 0;
  const trendColor = isPositive ? '#67E8A3' : '#FF9B9B';
  const statusText = data.isFallback ? 'Cached' : 'Live';
  const isLightMode = theme.mode === 'light';
  const cardColors = isLightMode
    ? [
        metal.gradient[0].replace(/0\.\d+\)/, '0.20)'),
        'rgba(255,255,255,0.96)',
        'rgba(241,245,249,0.98)',
      ]
    : metal.gradient;
  const titleColor = isLightMode ? '#10213A' : '#FFFFFF';
  const secondaryTextColor = isLightMode
    ? 'rgba(16,33,58,0.68)'
    : 'rgba(255,255,255,0.72)';
  const mutedTextColor = isLightMode
    ? 'rgba(16,33,58,0.56)'
    : 'rgba(255,255,255,0.56)';
  const priceColor = isLightMode ? '#10213A' : '#FFFFFF';
  const metaValueColor = isLightMode ? '#24364D' : '#FFFFFF';
  const timestampColor = isLightMode
    ? 'rgba(16,33,58,0.70)'
    : 'rgba(255,255,255,0.68)';
  const blurFallbackColor = isLightMode
    ? 'rgba(255,255,255,0.90)'
    : 'rgba(255,255,255,0.08)';
  const containerToneStyle = isLightMode
    ? styles.containerLight
    : styles.containerDark;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(metal, data)}
      style={styles.pressable}>
      <LinearGradient
        colors={cardColors}
        style={[
          styles.container,
          containerToneStyle,
        ]}>
        <BlurView
          blurAmount={14}
          blurType="light"
          reducedTransparencyFallbackColor={blurFallbackColor}
          style={styles.blurLayer}
        />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.name, {color: titleColor}]}>{metal.name}</Text>
              <Text style={[styles.symbol, {color: secondaryTextColor}]}>
                {metal.symbol} / USD
              </Text>
            </View>
            {showRefreshing ? (
              <ActivityIndicator color={metal.accent} size="small" />
            ) : (
              <View style={styles.statusWrap}>
                <View
                  style={[
                    styles.pulse,
                    isPositive ? styles.positivePulse : styles.negativePulse,
                  ]}
                />
                <Text style={[styles.statusText, {color: secondaryTextColor}]}>
                  {statusText}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.price, {color: priceColor}]}>
            {formatUsd(data.price)}
          </Text>

          <View style={styles.metricsRow}>
            <Text style={[styles.change, {color: trendColor}]}>
              {`${data.ch >= 0 ? '+' : ''}${formatNumber(data.ch)} (${formatPercent(
                data.chp,
              )})`}
            </Text>
            <Text style={[styles.gramPrice, {color: metaValueColor}]}>
              24K/g {formatUsdCompact(data.price_gram_24k)}
            </Text>
          </View>

          <View style={styles.chartWrap}>
            <Sparkline
              color={trendColor}
              data={[
                data.prev_close_price,
                data.open_price,
                data.low_price,
                data.high_price,
                data.price,
              ]}
            />
          </View>

          <View style={styles.chartLabelsRow}>
            <View>
              <Text style={[styles.chartLabelCaption, {color: mutedTextColor}]}>
                Open
              </Text>
              <Text style={[styles.chartLabelValue, {color: metaValueColor}]}>
                {formatUsdCompact(data.open_price)}
              </Text>
            </View>
            <View style={styles.chartLabelRight}>
              <Text style={[styles.chartLabelCaption, {color: mutedTextColor}]}>
                Now
              </Text>
              <Text style={[styles.chartLabelValue, {color: metaValueColor}]}>
                {formatUsdCompact(data.price)}
              </Text>
            </View>
          </View>

          <Text style={[styles.timestamp, {color: timestampColor}]}>
            {data.isFallback ? 'Sample data' : `Updated ${formatTimestamp(data.timestamp)}`}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: 18,
  },
  container: {
    borderRadius: 28,
    borderWidth: 1,
    minHeight: 198,
    overflow: 'hidden',
  },
  containerDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15,23,42,0.10)',
  },
  blurLayer: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  pulse: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  positivePulse: {
    backgroundColor: '#2DD4BF',
  },
  negativePulse: {
    backgroundColor: '#FB7185',
  },
  statusText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  symbol: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    marginTop: 4,
  },
  price: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 18,
  },
  metricsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  change: {
    fontSize: 14,
    fontWeight: '700',
  },
  gramPrice: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  chartWrap: {
    marginTop: 14,
  },
  chartLabelsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartLabelRight: {
    alignItems: 'flex-end',
  },
  chartLabelCaption: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 11,
  },
  chartLabelValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12,
    marginTop: 8,
  },
  errorContainer: {
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 18,
    minHeight: 198,
    padding: 20,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  errorText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
