import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Lote, EstadoLote } from '@/lib/types';

interface BatchFilters {
  owner?: string;
  estado?: EstadoLote;
  empresa_origen?: string;
}

/**
 * Hook to fetch batches from Supabase with optional filters
 */
export function useBatches(filters?: BatchFilters) {
  return useQuery({
    queryKey: ['batches', filters],
    queryFn: async () => {
      let query = supabase.from('batches').select('*');

      if (filters?.owner) {
        query = query.eq('owner_actual', filters.owner);
      }

      if (filters?.estado) {
        query = query.eq('estado', filters.estado);
      }

      if (filters?.empresa_origen) {
        query = query.eq('empresa_origen', filters.empresa_origen);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch batches:', error);
        throw error;
      }

      // Map database records to Lote type
      return (data || []).map(record => ({
        id: record.id,
        batch_id: record.batch_id,
        tipo_residuo: record.tipo_residuo,
        peso_kg: record.peso_kg,
        peso_recibido: record.peso_recibido || undefined,
        kg_reciclados: record.kg_reciclados || undefined,
        estado: record.estado,
        owner_actual: record.owner_actual,
        empresa_origen: record.empresa_origen,
        tokens_grt: record.tokens_grt || 0,
        tx_hash: record.creation_tx_hash,
        created_at: record.created_at,
        updated_at: record.updated_at,
      })) as Lote[];
    },
    refetchInterval: 10000, // Poll every 10 seconds for new data
    staleTime: 5000,
  });
}

/**
 * Hook to fetch a single batch by ID
 */
export function useBatch(batchId: string | null) {
  return useQuery({
    queryKey: ['batch', batchId],
    queryFn: async () => {
      if (!batchId) return null;

      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('batch_id', batchId)
        .single();

      if (error) {
        console.error('Failed to fetch batch:', error);
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        batch_id: data.batch_id,
        tipo_residuo: data.tipo_residuo,
        peso_kg: data.peso_kg,
        peso_recibido: data.peso_recibido || undefined,
        kg_reciclados: data.kg_reciclados || undefined,
        estado: data.estado,
        owner_actual: data.owner_actual,
        empresa_origen: data.empresa_origen,
        tokens_grt: data.tokens_grt || 0,
        tx_hash: data.creation_tx_hash,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as Lote;
    },
    enabled: !!batchId,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}
