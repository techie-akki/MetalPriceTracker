import {useQuery} from '@tanstack/react-query';
import {FALLBACK_QUOTES} from '../fallbacks';
import {getMetal} from '../api/getMetal';
import {MetalQuote, MetalSymbol} from '../types';

interface UseMetalOptions {
  enabled?: boolean;
  initialData?: MetalQuote;
  refetchOnMount?: boolean | 'always';
  staleTime?: number;
}

export const useMetal = (symbol: MetalSymbol, options?: UseMetalOptions) => {
  return useQuery({
    enabled: options?.enabled,
    queryKey: ['metal', symbol],
    queryFn: () => getMetal(symbol),
    initialData: options?.initialData ?? FALLBACK_QUOTES[symbol],
    placeholderData: previousData => previousData ?? FALLBACK_QUOTES[symbol],
    staleTime: options?.staleTime,
    refetchOnMount: options?.refetchOnMount,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retryOnMount: false,
  });
};
