import { useQuery } from '@tanstack/react-query';
import { getGRTTokenContract } from '../contracts/grt-token';

/**
 * Hook to get GRT token balance for an address
 */
export function useGRTBalance(address: string | null) {
  return useQuery({
    queryKey: ['grtBalance', address],
    queryFn: async () => {
      if (!address) return 0;
      return await getGRTTokenContract().getBalance(address);
    },
    enabled: !!address,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000,
  });
}

/**
 * Hook to get total GRT token supply
 */
export function useGRTTotalSupply() {
  return useQuery({
    queryKey: ['grtTotalSupply'],
    queryFn: async () => {
      return await getGRTTokenContract().getTotalSupply();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000,
  });
}
