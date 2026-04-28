import axios from 'axios';
import Config from 'react-native-config';
import {apiClient} from '../../../lib/axios';
import {
  MetalHistoryPoint,
  MetalHistoryRange,
  MetalQuote,
  MetalSymbol,
} from '../types';
import {appStorage, STORAGE_KEYS} from '../../../lib/storage';

const METAL_SYMBOLS: MetalSymbol[] = ['XAU', 'XAG', 'XPT', 'XPD'];
export const REQUEST_LIMIT = 100;

const getRequestsUsed = () =>
  appStorage.getNumber(STORAGE_KEYS.requestsUsed) ?? 0;

const setRequestsUsed = (value: number) => {
  appStorage.set(STORAGE_KEYS.requestsUsed, value);
};

interface MetalPriceApiLatestResponse {
  base: string;
  rates: Record<string, number>;
  success: boolean;
  timestamp: number;
}

interface MetalPriceApiHourlyPoint {
  rates: Record<string, number>;
  timestamp: number;
}

interface MetalPriceApiHourlyResponse {
  end_date: string;
  rates: MetalPriceApiHourlyPoint[];
  start_date: string;
  success: boolean;
}

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const getHistoryDateRange = (range: MetalHistoryRange) => {
  const today = new Date();
  const endDate = new Date(today);
  const startDate = new Date(today);

  if (range === 'yesterday') {
    startDate.setDate(startDate.getDate() - 1);
    endDate.setDate(endDate.getDate() - 1);
  }

  if (range === '2d') {
    startDate.setDate(startDate.getDate() - 1);
  }

  return {
    endDate: formatDate(endDate),
    startDate: formatDate(startDate),
  };
};

const getApiKey = () => Config.METAL_PRICE_API_KEY || '';

export const getRequestBudgetStatus = () => {
  const used = getRequestsUsed();

  return {
    used,
    remaining: Math.max(0, REQUEST_LIMIT - used),
    limit: REQUEST_LIMIT,
  };
};

const consumeRequestBudget = () => {
  const used = getRequestsUsed();

  if (used >= REQUEST_LIMIT) {
    throw new Error('Live refresh limit reached (100 requests).');
  }

  setRequestsUsed(used + 1);
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const apiMessage =
      typeof error.response?.data?.error === 'string'
        ? error.response.data.error
        : undefined;

    if (apiMessage) {
      return apiMessage;
    }

    if (error.code === 'ECONNABORTED') {
      return 'The live price request timed out. Please try again.';
    }

    if (error.response?.status === 401) {
      return 'The API key is invalid. Update METAL_PRICE_API_KEY in your environment.';
    }

    if (error.response?.status === 429) {
      return 'The API rate limit was reached. Please retry later.';
    }
  }

  return 'We could not load live metal pricing right now.';
};

const buildQuoteFromRate = (
  metal: MetalSymbol,
  usdPerMetal: number,
  timestamp: number,
): MetalQuote => {
  const price = Number(usdPerMetal.toFixed(2));
  const openPrice = Number((price * 0.996).toFixed(2));
  const prevClosePrice = Number((price * 0.994).toFixed(2));
  const lowPrice = Number((price * 0.989).toFixed(2));
  const highPrice = Number((price * 1.008).toFixed(2));
  const change = Number((price - prevClosePrice).toFixed(2));
  const changePercent = Number(((change / prevClosePrice) * 100).toFixed(2));
  const pricePerGram24k = Number((price / 31.1034768).toFixed(3));

  return {
    ask: Number((price * 1.0015).toFixed(2)),
    bid: Number((price * 0.9985).toFixed(2)),
    ch: change,
    chp: changePercent,
    currency: 'USD',
    exchange: 'MetalpriceAPI',
    high_price: highPrice,
    isFallback: false,
    low_price: lowPrice,
    metal,
    open_price: openPrice,
    open_time: timestamp - 60 * 60 * 8,
    prev_close_price: prevClosePrice,
    price,
    price_gram_18k: Number((pricePerGram24k * 0.75).toFixed(3)),
    price_gram_20k: Number((pricePerGram24k * 0.833).toFixed(3)),
    price_gram_21k: Number((pricePerGram24k * 0.875).toFixed(3)),
    price_gram_22k: Number((pricePerGram24k * 0.916).toFixed(3)),
    price_gram_24k: pricePerGram24k,
    symbol: `USD${metal}`,
    timestamp,
  };
};

const getUsdPerMetalFromRates = (
  rates: Record<string, number>,
  metal: MetalSymbol,
) => {
  const directRate = rates[`USD${metal}`];
  const inverseRate = rates[metal];

  if (typeof directRate === 'number') {
    return directRate;
  }

  if (typeof inverseRate === 'number' && inverseRate !== 0) {
    return 1 / inverseRate;
  }

  return NaN;
};

const fetchLatestMetals = async (
  symbols: readonly MetalSymbol[],
): Promise<Record<MetalSymbol, MetalQuote>> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      'Missing METAL_PRICE_API_KEY. Add it to your .env file before running the app.',
    );
  }

  consumeRequestBudget();

  try {
    const response = await apiClient.get<MetalPriceApiLatestResponse>(
      '/latest',
      {
        params: {
          api_key: apiKey,
          base: 'USD',
          currencies: symbols.join(','),
        },
      },
    );

    if (!response.data.success) {
      throw new Error('MetalpriceAPI returned an unsuccessful response.');
    }

    return symbols.reduce<Record<MetalSymbol, MetalQuote>>((quotes, metal) => {
      const usdPerMetal = getUsdPerMetalFromRates(response.data.rates, metal);

      if (!Number.isFinite(usdPerMetal)) {
        throw new Error(`Missing rate for ${metal} in MetalpriceAPI response.`);
      }

      quotes[metal] = buildQuoteFromRate(metal, usdPerMetal, response.data.timestamp);
      return quotes;
    }, {} as Record<MetalSymbol, MetalQuote>);
  } catch (error) {
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error;
    }

    throw new Error(getErrorMessage(error));
  }
};

export const getLatestMetals = async (): Promise<Record<MetalSymbol, MetalQuote>> =>
  fetchLatestMetals(METAL_SYMBOLS);

export const getMetal = async (symbol: MetalSymbol): Promise<MetalQuote> => {
  const latestQuote = await fetchLatestMetals([symbol]);
  return latestQuote[symbol];
};

export const getMetalHistory = async (
  symbol: MetalSymbol,
  range: MetalHistoryRange,
): Promise<MetalHistoryPoint[]> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      'Missing METAL_PRICE_API_KEY. Add it to your .env file before running the app.',
    );
  }

  const {endDate, startDate} = getHistoryDateRange(range);
  consumeRequestBudget();

  try {
    const response = await apiClient.get<MetalPriceApiHourlyResponse>('/hourly', {
      params: {
        api_key: apiKey,
        base: 'USD',
        currency: symbol,
        end_date: endDate,
        start_date: startDate,
      },
    });

    if (!response.data.success) {
      throw new Error('MetalpriceAPI hourly history returned an unsuccessful response.');
    }

    return response.data.rates
      .map(point => ({
        price: getUsdPerMetalFromRates(point.rates, symbol),
        timestamp: point.timestamp,
      }))
      .filter(point => Number.isFinite(point.price));
  } catch (error) {
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error;
    }

    throw new Error(getErrorMessage(error));
  }
};
