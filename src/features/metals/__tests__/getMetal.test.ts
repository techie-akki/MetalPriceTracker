import {apiClient} from '../../../lib/axios';
import {appStorage} from '../../../lib/storage';
import {getLatestMetals, getMetal} from '../api/getMetal';

jest.mock('../../../lib/axios', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockedGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;

beforeEach(() => {
  mockedGet.mockReset();
  appStorage.clearAll();
});

test('fetches a single live symbol for getMetal', async () => {
  mockedGet.mockResolvedValue({
    data: {
      base: 'USD',
      rates: {
        XAU: 0.0005,
      },
      success: true,
      timestamp: 1710003600,
    },
  });

  const quote = await getMetal('XAU');

  expect(mockedGet).toHaveBeenCalledWith('/latest', {
    params: {
      api_key: 'test',
      base: 'USD',
      currencies: 'XAU',
    },
  });
  expect(quote.metal).toBe('XAU');
  expect(quote.isFallback).toBe(false);
});

test('fetches all tracked metals for getLatestMetals', async () => {
  mockedGet.mockResolvedValue({
    data: {
      base: 'USD',
      rates: {
        XAU: 0.0005,
        XAG: 0.04,
        XPT: 0.001,
        XPD: 0.0008,
      },
      success: true,
      timestamp: 1710003600,
    },
  });

  const quotes = await getLatestMetals();

  expect(mockedGet).toHaveBeenCalledWith('/latest', {
    params: {
      api_key: 'test',
      base: 'USD',
      currencies: 'XAU,XAG,XPT,XPD',
    },
  });
  expect(Object.keys(quotes)).toEqual(['XAU', 'XAG', 'XPT', 'XPD']);
});
