import '@testing-library/jest-native/extend-expect';

jest.mock('react-native-config', () => ({
  METAL_PRICE_API_KEY: 'test',
  METAL_PRICE_API_BASE_URL: 'https://api.metalpriceapi.com/v1',
}));

jest.mock('@react-native-community/blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: 'GestureHandlerRootView',
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock('react-native-mmkv', () => {
  let store: Record<string, string | number | boolean> = {};

  return {
    createMMKV: () => ({
      getNumber: (key: string) =>
        typeof store[key] === 'number' ? (store[key] as number) : undefined,
      getBoolean: (key: string) =>
        typeof store[key] === 'boolean' ? (store[key] as boolean) : undefined,
      set: (key: string, value: string | number | boolean) => {
        store[key] = value;
      },
      clearAll: () => {
        store = {};
      },
    }),
  };
});
