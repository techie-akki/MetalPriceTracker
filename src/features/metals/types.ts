export type MetalSymbol = 'XAU' | 'XAG' | 'XPT' | 'XPD';

export interface MetalQuote {
  timestamp: number;
  metal: MetalSymbol;
  currency: string;
  exchange: string;
  isFallback?: boolean;
  symbol: string;
  prev_close_price: number;
  open_price: number;
  low_price: number;
  high_price: number;
  open_time: number;
  price: number;
  ch: number;
  chp: number;
  ask?: number;
  bid?: number;
  price_gram_24k?: number;
  price_gram_22k?: number;
  price_gram_21k?: number;
  price_gram_20k?: number;
  price_gram_18k?: number;
}

export interface MetalHistoryPoint {
  price: number;
  timestamp: number;
}

export type MetalHistoryRange = 'today' | 'yesterday' | '2d';

export interface MetalDefinition {
  symbol: MetalSymbol;
  name: string;
  accent: string;
  gradient: [string, string, string];
}

export type RootStackParamList = {
  Home: undefined;
  Detail: {
    metal: MetalDefinition;
    initialData?: MetalQuote;
  };
};
