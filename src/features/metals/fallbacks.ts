import {MetalQuote, MetalSymbol} from './types';

const buildFallbackQuote = (
  metal: MetalSymbol,
  price: number,
  openPrice: number,
  lowPrice: number,
  highPrice: number,
  priceGram24k: number,
): MetalQuote => {
  const now = Math.floor(Date.now() / 1000);
  const prevClosePrice = openPrice - 4;
  const change = price - prevClosePrice;
  const percentChange = Number(((change / prevClosePrice) * 100).toFixed(2));

  return {
    ask: price + 1.2,
    bid: price - 1.2,
    ch: Number(change.toFixed(2)),
    chp: percentChange,
    currency: 'USD',
    exchange: 'Fallback Feed',
    high_price: highPrice,
    isFallback: true,
    low_price: lowPrice,
    metal,
    open_price: openPrice,
    open_time: now - 60 * 60 * 8,
    prev_close_price: prevClosePrice,
    price,
    price_gram_18k: Number((priceGram24k * 0.75).toFixed(3)),
    price_gram_20k: Number((priceGram24k * 0.833).toFixed(3)),
    price_gram_21k: Number((priceGram24k * 0.875).toFixed(3)),
    price_gram_22k: Number((priceGram24k * 0.916).toFixed(3)),
    price_gram_24k: priceGram24k,
    symbol: `FALLBACK:${metal}USD`,
    timestamp: now,
  };
};

export const FALLBACK_QUOTES: Record<MetalSymbol, MetalQuote> = {
  XAU: buildFallbackQuote('XAU', 2328.4, 2318.1, 2309.5, 2336.8, 74.86),
  XAG: buildFallbackQuote('XAG', 27.31, 27.02, 26.88, 27.54, 0.878),
  XPT: buildFallbackQuote('XPT', 962.7, 955.2, 949.1, 971.3, 30.95),
  XPD: buildFallbackQuote('XPD', 1018.6, 1006.8, 998.4, 1027.9, 32.75),
};
