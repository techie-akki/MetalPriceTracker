import {useQuery} from '@tanstack/react-query';
import {getMetalHistory} from '../api/getMetal';
import {MetalHistoryPoint, MetalHistoryRange, MetalSymbol} from '../types';

interface UseMetalHistoryOptions {
  enabled?: boolean;
}

export const useMetalHistory = (
  symbol: MetalSymbol,
  range: MetalHistoryRange,
  options?: UseMetalHistoryOptions,
) => {
  return useQuery<MetalHistoryPoint[]>({
    enabled: options?.enabled,
    queryKey: ['metal-history', symbol, range],
    queryFn: () => getMetalHistory(symbol, range),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60 * 60 * 8,
  });
};
