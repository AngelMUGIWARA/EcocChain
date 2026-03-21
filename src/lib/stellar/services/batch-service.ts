import { getBatchRegistryContract } from '../contracts/batch-registry';
import { freighterService } from '../client/freighter';
import { TipoResiduo } from '@/lib/types';
import { BatchResult, TransactionResult } from '../contracts/contract-types';
import { fundAccountWithFriendbot, hasSufficientBalance } from '../utils/friendbot';
import { supabase } from '@/integrations/supabase/client';

export class BatchService {
  /**
   * Create a new batch
   */
  async createBatch(tipoResiduo: TipoResiduo, pesoKg: number): Promise<BatchResult> {
    const publicKey = await freighterService.getPublicKey();

    const hasBalance = await hasSufficientBalance(publicKey);
    if (!hasBalance) {
      await fundAccountWithFriendbot(publicKey);
    }

    const xdr = await getBatchRegistryContract().buildCreateBatchTx(publicKey, tipoResiduo, pesoKg);
    const signedXdr = await freighterService.signTransaction(xdr);
    const result = await getBatchRegistryContract().submitSignedTx(signedXdr);

    const batchId = result.returnValue != null ? String(result.returnValue) : Date.now().toString();

    await supabase.from('batches').insert({
      batch_id: batchId,
      tipo_residuo: tipoResiduo,
      peso_kg: pesoKg,
      estado: 'pendiente',
      owner_actual: publicKey,
      empresa_origen: publicKey,
      tokens_grt: 0,
      creation_tx_hash: result.txHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await supabase.from('transfers').insert({
      batch_id: batchId,
      de: publicKey,
      para: publicKey,
      accion: 'creado',
      tx_hash: result.txHash,
      ledger_number: result.ledger,
      timestamp: new Date().toISOString(),
    });

    return { ...result, batchId };
  }

  /**
   * Accept pickup of a batch (transportista)
   */
  async acceptPickup(batchId: string): Promise<TransactionResult> {
    const publicKey = await freighterService.getPublicKey();

    const hasBalance = await hasSufficientBalance(publicKey);
    if (!hasBalance) {
      await fundAccountWithFriendbot(publicKey);
    }

    const xdr = await getBatchRegistryContract().buildAcceptPickupTx(publicKey, batchId);
    const signedXdr = await freighterService.signTransaction(xdr);
    const result = await getBatchRegistryContract().submitSignedTx(signedXdr);

    await supabase.from('batches')
      .update({ estado: 'en_transito', owner_actual: publicKey, last_tx_hash: result.txHash, updated_at: new Date().toISOString() })
      .eq('batch_id', batchId);

    await supabase.from('transfers').insert({
      batch_id: batchId,
      de: publicKey,
      para: publicKey,
      accion: 'transferido',
      tx_hash: result.txHash,
      ledger_number: result.ledger,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  /**
   * Confirm reception of a batch (acopio)
   */
  async confirmReception(batchId: string, pesoRecibido: number): Promise<TransactionResult> {
    const publicKey = await freighterService.getPublicKey();

    const hasBalance = await hasSufficientBalance(publicKey);
    if (!hasBalance) {
      await fundAccountWithFriendbot(publicKey);
    }

    const xdr = await getBatchRegistryContract().buildConfirmReceptionTx(publicKey, batchId, pesoRecibido);
    const signedXdr = await freighterService.signTransaction(xdr);
    const result = await getBatchRegistryContract().submitSignedTx(signedXdr);

    await supabase.from('batches')
      .update({ estado: 'en_acopio', owner_actual: publicKey, peso_recibido: pesoRecibido, last_tx_hash: result.txHash, updated_at: new Date().toISOString() })
      .eq('batch_id', batchId);

    await supabase.from('transfers').insert({
      batch_id: batchId,
      de: publicKey,
      para: publicKey,
      accion: 'confirmado',
      peso_recibido: pesoRecibido,
      tx_hash: result.txHash,
      ledger_number: result.ledger,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  /**
   * Confirm recycling and mint GRT tokens (recicladora)
   */
  async confirmRecycling(batchId: string, kgReciclados: number): Promise<TransactionResult & { tokensMinted: number }> {
    const publicKey = await freighterService.getPublicKey();

    const hasBalance = await hasSufficientBalance(publicKey);
    if (!hasBalance) {
      await fundAccountWithFriendbot(publicKey);
    }

    const xdr = await getBatchRegistryContract().buildConfirmRecyclingTx(publicKey, batchId, kgReciclados);
    const signedXdr = await freighterService.signTransaction(xdr);
    const result = await getBatchRegistryContract().submitSignedTx(signedXdr);

    await supabase.from('batches')
      .update({ estado: 'reciclado', kg_reciclados: kgReciclados, tokens_grt: kgReciclados, last_tx_hash: result.txHash, updated_at: new Date().toISOString() })
      .eq('batch_id', batchId);

    await supabase.from('transfers').insert({
      batch_id: batchId,
      de: publicKey,
      para: publicKey,
      accion: 'confirmado',
      kg_reciclados: kgReciclados,
      tokens_emitidos: kgReciclados,
      tx_hash: result.txHash,
      ledger_number: result.ledger,
      timestamp: new Date().toISOString(),
    });

    return { ...result, tokensMinted: kgReciclados };
  }

  /**
   * Purchase a batch (compradora)
   */
  async purchaseBatch(batchId: string): Promise<TransactionResult> {
    const publicKey = await freighterService.getPublicKey();

    const hasBalance = await hasSufficientBalance(publicKey);
    if (!hasBalance) {
      await fundAccountWithFriendbot(publicKey);
    }

    const xdr = await getBatchRegistryContract().buildPurchaseBatchTx(publicKey, batchId);
    const signedXdr = await freighterService.signTransaction(xdr);
    const result = await getBatchRegistryContract().submitSignedTx(signedXdr);

    await supabase.from('batches')
      .update({ estado: 'comprado', owner_actual: publicKey, last_tx_hash: result.txHash, updated_at: new Date().toISOString() })
      .eq('batch_id', batchId);

    await supabase.from('transfers').insert({
      batch_id: batchId,
      de: publicKey,
      para: publicKey,
      accion: 'comprado',
      tx_hash: result.txHash,
      ledger_number: result.ledger,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  async getBatch(batchId: string) {
    return await getBatchRegistryContract().getBatch(batchId);
  }
}

// Export singleton instance
export const batchService = new BatchService();
