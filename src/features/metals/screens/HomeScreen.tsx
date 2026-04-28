import React from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getLatestMetals, getRequestBudgetStatus } from '../api/getMetal';
import MetalTile from '../components/MetalTile';
import { METALS } from '../constants';
import { RootStackParamList } from '../types';
import { useTheme } from '../../../shared/theme/ThemeContext';
import { appStorage, STORAGE_KEYS } from '../../../lib/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const REFRESH_CONTROL_TIMEOUT_MS = 1200;

export default function HomeScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshPulse, setRefreshPulse] = React.useState(0);
  const [refreshMessage, setRefreshMessage] = React.useState(
    'Sample prices are shown by default. You have 100 live requests for this app install.',
  );

  const runInitialLiveFetchIfNeeded = React.useCallback(async () => {
    const lastAutoFetchAt = appStorage.getNumber(
      STORAGE_KEYS.lastAutoLiveFetchAt,
    );
    const hasLegacyAutoFetchFlag = appStorage.getBoolean(
      STORAGE_KEYS.lastAutoLiveFetchAt,
    );

    if (typeof lastAutoFetchAt === 'number' || hasLegacyAutoFetchFlag) {
      return;
    }

    try {
      const latestQuotes = await getLatestMetals();
      METALS.forEach(metal => {
        queryClient.setQueryData(
          ['metal', metal.symbol],
          latestQuotes[metal.symbol],
        );
      });

      appStorage.set(STORAGE_KEYS.lastAutoLiveFetchAt, Date.now());

      const budget = getRequestBudgetStatus();
      setRefreshMessage(
        `Loaded live prices on first launch. ${budget.remaining}/${budget.limit} requests left.`,
      );
    } catch (error) {
      setRefreshMessage(
        error instanceof Error
          ? error.message
          : 'Could not load live prices on first launch. Showing sample data.',
      );
    }
  }, [queryClient]);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshPulse(value => value + 1);
    const budgetBefore = getRequestBudgetStatus();
    setRefreshMessage(
      `Refreshing live prices... ${budgetBefore.remaining}/${budgetBefore.limit} requests left.`,
    );

    const hideRefreshControl = setTimeout(() => {
      setRefreshing(false);
    }, REFRESH_CONTROL_TIMEOUT_MS);

    try {
      const latestQuotes = await getLatestMetals();
      METALS.forEach(metal => {
        queryClient.setQueryData(
          ['metal', metal.symbol],
          latestQuotes[metal.symbol],
        );
      });

      const budgetAfter = getRequestBudgetStatus();
      setRefreshMessage(
        `Live refresh completed. ${budgetAfter.remaining}/${budgetAfter.limit} requests left.`,
      );
    } catch (error) {
      setRefreshMessage(
        error instanceof Error
          ? error.message
          : 'Could not refresh live prices. Keeping cached values on screen.',
      );
    } finally {
      clearTimeout(hideRefreshControl);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    runInitialLiveFetchIfNeeded();
  }, [runInitialLiveFetchIfNeeded]);

  const goDetail: React.ComponentProps<typeof MetalTile>['onPress'] = (
    metal,
    data,
  ) => navigation.navigate('Detail', { metal, initialData: data });

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.content}
        data={METALS}
        keyExtractor={item => item.symbol}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>
                Live precious metal prices
              </Text>
              <Pressable
                onPress={toggleTheme}
                style={[
                  styles.themeToggle,
                  {
                    backgroundColor: theme.colors.panel,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.themeToggleText,
                    { color: theme.colors.primaryText },
                  ]}
                >
                  {theme.mode === 'dark' ? 'Light' : 'Dark'}
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.title, { color: theme.colors.primaryText }]}>
              Track Gold, Silver, Platinum and Palladium
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.secondaryText }]}
            >
              Prices are fetched live on initial load. For a faster experience,
              cached data is used afterward. Pull to refresh whenever you need
              real-time updates.
            </Text>
            <Text style={[styles.helper, { color: theme.colors.accent }]}>
              {refreshMessage}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            tintColor={theme.colors.primaryText}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        renderItem={({ item }) => (
          <MetalTile
            metal={item}
            onPress={goDetail}
            refreshPulse={refreshPulse}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 22,
    marginTop: 8,
  },
  headerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  themeToggle: {
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  helper: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
});
