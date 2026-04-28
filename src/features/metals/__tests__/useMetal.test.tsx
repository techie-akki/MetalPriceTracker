import React, {PropsWithChildren} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {renderHook, waitFor} from '@testing-library/react-native';
import {getMetal} from '../api/getMetal';
import {useMetal} from '../hooks/useMetal';

jest.mock('../api/getMetal', () => ({
  getMetal: jest.fn(),
}));

const mockedGetMetal = getMetal as jest.MockedFunction<typeof getMetal>;

beforeEach(() => {
  mockedGetMetal.mockReset();
});

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 0,
        retry: false,
      },
    },
  });

  const wrapper = ({children}: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return {client, wrapper};
};

test('fetches a metal price', async () => {
  mockedGetMetal.mockResolvedValue({
    ask: 101,
    bid: 99,
    ch: 2,
    chp: 2.04,
    currency: 'USD',
    exchange: 'FOREXCOM',
    high_price: 103,
    low_price: 97,
    metal: 'XAU',
    open_price: 98,
    open_time: 1710000000,
    prev_close_price: 98,
    price: 100,
    price_gram_24k: 3.2,
    symbol: 'FOREXCOM:XAUUSD',
    timestamp: 1710003600,
  });

  const {client, wrapper} = createWrapper();
  const {result, unmount} = renderHook(() => useMetal('XAU'), {
    wrapper,
  });

  await waitFor(() => expect(mockedGetMetal).toHaveBeenCalledWith('XAU'));
  await waitFor(() => expect(result.current.data?.price).toBe(100));

  expect(result.current.data?.price).toBe(100);
  expect(mockedGetMetal).toHaveBeenCalledWith('XAU');

  unmount();
  client.clear();
});

test('does not fetch automatically when disabled', async () => {
  const {client, wrapper} = createWrapper();

  const {result, unmount} = renderHook(
    () => useMetal('XAU', {enabled: false}),
    {
      wrapper,
    },
  );

  await waitFor(() => expect(result.current.data?.metal).toBe('XAU'));
  expect(mockedGetMetal).not.toHaveBeenCalled();

  unmount();
  client.clear();
});
