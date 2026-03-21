import { batchRegistryContract } from '../contracts/batch-registry';
import { freighterService } from '../client/freighter';
import { sorobanClient } from '../client/soroban-client';
import { TipoResiduo } from '@/lib/types';
import { BatchResult, TransactionResult } from '../contracts/contract-types';
import { fundAccountWithFriendbot, hasSufficientBalance } from '../utils/friendbot';

export class BatchService {
  /**
   * Create a new batch
   */
  async createBatch(tipoResiduo: TipoResiduo, pesoKg: number): Promise<BatchResult> {
    // 1. Get wallet public key
    const publicKey = await freighterService.getPublicKey();

    // 2. Check balance and fund if needed
    const hasBalance = await hasSufficientBalance(publicKey);
    if (!hasBalance) {
      console.log('Insufficient balance, funding account...');
      await fundAccountWithFriendbot(publicKey);
    }

    // 3. Build transaction
    const xdr = await batchRegistryContract.buildCreateBatchTx(publicKey, tipoResiduo, pesoKg);

    // 4. Sign with Freighter (opens popup)
    const signedXdr = await freighterService.signTransaction(xdr);

    // 5. Submit to network
    const result = await batchRegistryContract.submitSignedTx(signedXdr);

    // 6. Extract batch ID from transaction result
    // In a real scenario, we'd parse the event or return value
    // For now, we'll fetch the latest batch count as approximation
    const batchId = Date.now().toString(); // Temporary - should come from contract event

    return {
      ...result,
      batchId,
    };
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

    const xdr = await batchRegistryContract.buildAcceptPickupTx(publicKey, batchId);
    const signedXdr = await freighterService.signTransaction(xdr);

    return await batchRegistryContract.submitSignedTx(signedXdr);
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

    const xdr = await batchRegistryContract.buildConfirmReceptionTx(
      publicKey,
      batchId,
      pesoRecibido
    );
    const signedXdr = await freighterService.signTransaction(xdr);

    return await batchRegistryContract.submitSignedTx(signedXdr);
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

    const xdr = await batchRegistryContract.buildConfirmRecyclingTx(
      publicKey,
      batchId,
      kgReciclados
    );
    const signedXdr = await freighterService.signTransaction(xdr);

    const result = await batchRegistryContract.submitSignedTx(signedXdr);

    // Tokens minted = kg_reciclados (1:1 ratio)
    return {
      ...result,
      tokensMinted: kgReciclados,
    };
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

    const xdr = await batchRegistryContract.buildPurchaseBatchTx(publicKey, batchId);
    const signedXdr = await freighterService.signTransaction(xdr);

    return await batchRegistryContract.submitSignedTx(signedXdr);
  }

  /**
   * Get batch data
   */
  async getBatch(batchId: string) {
    return await batchRegistryContract.getBatch(batchId);
  }
}

// Export singleton instance
export const batchService = new BatchService();
