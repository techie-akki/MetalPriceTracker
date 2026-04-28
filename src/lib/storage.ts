import {createMMKV} from 'react-native-mmkv';

export const appStorage = createMMKV({
  id: 'metal-price-tracker',
});

export const STORAGE_KEYS = {
  requestsUsed: 'requests_used',
  lastAutoLiveFetchAt: 'last_auto_live_fetch_at',
} as const;