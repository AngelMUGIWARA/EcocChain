import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Transferencia } from '@/lib/types';

/**
 * Hook to fetch transfers for a specific batch
 */
export function useTransfers(batchId: string | null) {
  return useQuery({
    queryKey: ['transfers', batchId],
    queryFn: async () => {
      if (!batchId) return [];

      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          de_user:users!transfers_de_fkey(nombre),
          para_user:users!transfers_para_fkey(nombre)
        `)
        .eq('batch_id', batchId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Failed to fetch transfers:', error);
        // Return empty array instead of throwing to gracefully handle missing data
        return [];
      }

      return (data || []).map(record => ({
        id: record.id,
        lote_id: record.batch_id,
        de: record.de,
        para: record.para,
        accion: record.accion,
        tx_hash: record.tx_hash,
        timestamp: record.timestamp,
        de_nombre: record.de_user?.nombre,
        para_nombre: record.para_user?.nombre,
      })) as Transferencia[];
    },
    enabled: !!batchId,
    refetchInterval: 10000, // Poll every 10 seconds
    staleTime: 5000,
  });
}

/**
 * Hook to fetch all transfers for a user
 */
export function useUserTransfers(walletAddress: string | null) {
  return useQuery({
    queryKey: ['userTransfers', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];

      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .or(`de.eq.${walletAddress},para.eq.${walletAddress}`)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to fetch user transfers:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!walletAddress,
    refetchInterval: 15000,
  });
}
