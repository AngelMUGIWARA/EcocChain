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
        .select('*')
        .eq('batch_id', batchId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Failed to fetch transfers:', error);
        return [];
      }

      // Resolve wallet addresses → nombres via separate users query (no FK join exists)
      const addresses = [...new Set((data ?? []).flatMap(r => [r.de, r.para]))];
      const { data: usersData } = addresses.length
        ? await supabase.from('users').select('wallet_address, nombre').in('wallet_address', addresses)
        : { data: [] };

      const nameByWallet: Record<string, string> = Object.fromEntries(
        (usersData ?? []).map(u => [u.wallet_address ?? '', u.nombre])
      );

      return (data ?? []).map(record => ({
        id: record.id,
        lote_id: record.batch_id,
        de: record.de,
        para: record.para,
        accion: record.accion as Transferencia['accion'],
        tx_hash: record.tx_hash,
        timestamp: record.timestamp,
        de_nombre: nameByWallet[record.de],
        para_nombre: nameByWallet[record.para],
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
