import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { batchService } from '../services/batch-service';
import { classifyError } from '../utils/error-handler';
import { StellarError } from '../contracts/contract-types';
import type { TipoResiduo } from '@/lib/types';
import { toast } from 'sonner';

export function useBatchOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<StellarError | null>(null);
  const queryClient = useQueryClient();

  /**
   * Generic operation executor with error handling and cache invalidation
   */
  const executeOperation = useCallback(
    async <T,>(
      operationFn: () => Promise<T>,
      successMessage: string
    ): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await operationFn();

        toast.success(successMessage);

        // Invalidate queries to refresh UI data
        queryClient.invalidateQueries({ queryKey: ['batches'] });
        queryClient.invalidateQueries({ queryKey: ['transfers'] });

        return result;
      } catch (err: any) {
        const stellarError = classifyError(err);
        setError(stellarError);
        toast.error(stellarError.userMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  /**
   * Create new batch (empresa)
   */
  const createBatch = useCallback(
    async (tipoResiduo: TipoResiduo, pesoKg: number) => {
      return executeOperation(
        () => batchService.createBatch(tipoResiduo, pesoKg),
        `Lote de ${pesoKg}kg de ${tipoResiduo} creado exitosamente`
      );
    },
    [executeOperation]
  );

  /**
   * Accept pickup (transportista)
   */
  const acceptPickup = useCallback(
    async (batchId: string) => {
      return executeOperation(
        () => batchService.acceptPickup(batchId),
        'Recolección aceptada exitosamente'
      );
    },
    [executeOperation]
  );

  /**
   * Confirm reception (acopio)
   */
  const confirmReception = useCallback(
    async (batchId: string, pesoRecibido: number) => {
      return executeOperation(
        () => batchService.confirmReception(batchId, pesoRecibido),
        `Recepción confirmada: ${pesoRecibido}kg recibidos`
      );
    },
    [executeOperation]
  );

  /**
   * Confirm recycling and mint tokens (recicladora)
   */
  const confirmRecycling = useCallback(
    async (batchId: string, kgReciclados: number) => {
      const result = await executeOperation(
        () => batchService.confirmRecycling(batchId, kgReciclados),
        `Reciclaje confirmado: ${kgReciclados} tokens GRT emitidos`
      );

      // Invalidate GRT balance query as well
      queryClient.invalidateQueries({ queryKey: ['grtBalance'] });

      return result;
    },
    [executeOperation, queryClient]
  );

  /**
   * Purchase batch (compradora)
   */
  const purchaseBatch = useCallback(
    async (batchId: string) => {
      return executeOperation(
        () => batchService.purchaseBatch(batchId),
        'Material comprado exitosamente'
      );
    },
    [executeOperation]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createBatch,
    acceptPickup,
    confirmReception,
    confirmRecycling,
    purchaseBatch,
    isLoading,
    error,
    clearError,
  };
}
