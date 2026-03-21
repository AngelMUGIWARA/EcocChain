import {
  Contract,
  rpc,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  xdr,
  nativeToScVal,
  scValToNative,
  Address,
  Account,
} from '@stellar/stellar-sdk';
import { CONFIG, CONTRACT_IDS } from '../config';
import { sorobanClient } from '../client/soroban-client';
import { freighterService } from '../client/freighter';
import { TipoResiduo, EstadoLote } from '@/lib/types';
import { BatchData, TransactionResult } from './contract-types';

export class BatchRegistryContract {
  private contract: Contract;

  constructor() {
    if (!CONTRACT_IDS.batchRegistry) {
      throw new Error('BatchRegistry contract ID not configured');
    }
    this.contract = new Contract(CONTRACT_IDS.batchRegistry);
  }

  /**
   * Build transaction to create a new batch
   */
  async buildCreateBatchTx(
    source: string,
    tipoResiduo: TipoResiduo,
    pesoKg: number
  ): Promise<string> {
    const account = await sorobanClient.getAccount(source);

    // Convert parameters to ScVal
    const params = [
      new Address(source).toScVal(),
      nativeToScVal(this.mapTipoResiduoToSymbol(tipoResiduo), { type: 'symbol' }),
      nativeToScVal(pesoKg, { type: 'u32' }),
    ];

    // Build transaction
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: CONFIG.networkPassphrase,
    })
      .addOperation(
        this.contract.call('create_batch', ...params)
      )
      .setTimeout(30)
      .build();

    // Simulate to get accurate fees
    const simulated = await sorobanClient.simulateTransaction(tx.toXDR());

    if (rpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation failed: ${simulated.error}`);
    }

    // Assemble with simulated result
    const assembled = rpc.assembleTransaction(tx, simulated);
    return assembled.build().toXDR();
  }

  /**
   * Build transaction to accept pickup (transportista)
   */
  async buildAcceptPickupTx(source: string, batchId: string): Promise<string> {
    const account = await sorobanClient.getAccount(source);

    const params = [
      new Address(source).toScVal(),
      nativeToScVal(parseInt(batchId), { type: 'u128' }),
    ];

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: CONFIG.networkPassphrase,
    })
      .addOperation(this.contract.call('accept_pickup', ...params))
      .setTimeout(30)
      .build();

    const simulated = await sorobanClient.simulateTransaction(tx.toXDR());

    if (rpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation failed: ${simulated.error}`);
    }

    const assembled = rpc.assembleTransaction(tx, simulated);
    return assembled.build().toXDR();
  }

  /**
   * Build transaction to confirm reception (acopio)
   */
  async buildConfirmReceptionTx(
    source: string,
    batchId: string,
    pesoRecibido: number
  ): Promise<string> {
    const account = await sorobanClient.getAccount(source);

    const params = [
      new Address(source).toScVal(),
      nativeToScVal(parseInt(batchId), { type: 'u128' }),
      nativeToScVal(pesoRecibido, { type: 'u32' }),
    ];

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: CONFIG.networkPassphrase,
    })
      .addOperation(this.contract.call('confirm_reception', ...params))
      .setTimeout(30)
      .build();

    const simulated = await sorobanClient.simulateTransaction(tx.toXDR());

    if (rpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation failed: ${simulated.error}`);
    }

    const assembled = rpc.assembleTransaction(tx, simulated);
    return assembled.build().toXDR();
  }

  /**
   * Build transaction to confirm recycling (recicladora)
   */
  async buildConfirmRecyclingTx(
    source: string,
    batchId: string,
    kgReciclados: number
  ): Promise<string> {
    const account = await sorobanClient.getAccount(source);

    const params = [
      new Address(source).toScVal(),
      nativeToScVal(parseInt(batchId), { type: 'u128' }),
      nativeToScVal(kgReciclados, { type: 'u32' }),
    ];

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: CONFIG.networkPassphrase,
    })
      .addOperation(this.contract.call('confirm_recycling', ...params))
      .setTimeout(30)
      .build();

    const simulated = await sorobanClient.simulateTransaction(tx.toXDR());

    if (rpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation failed: ${simulated.error}`);
    }

    const assembled = rpc.assembleTransaction(tx, simulated);
    return assembled.build().toXDR();
  }

  /**
   * Build transaction to purchase batch (compradora)
   */
  async buildPurchaseBatchTx(source: string, batchId: string): Promise<string> {
    const account = await sorobanClient.getAccount(source);

    const params = [
      new Address(source).toScVal(),
      nativeToScVal(parseInt(batchId), { type: 'u128' }),
    ];

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: CONFIG.networkPassphrase,
    })
      .addOperation(this.contract.call('purchase_batch', ...params))
      .setTimeout(30)
      .build();

    const simulated = await sorobanClient.simulateTransaction(tx.toXDR());

    if (rpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation failed: ${simulated.error}`);
    }

    const assembled = rpc.assembleTransaction(tx, simulated);
    return assembled.build().toXDR();
  }

  /**
   * Get batch data (read-only, no signing needed)
   */
  async getBatch(batchId: string): Promise<BatchData | null> {
    try {
      const params = [nativeToScVal(parseInt(batchId), { type: 'u128' })];

      // For read-only calls, we need a dummy source account
      const dummyAccount = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
      const account = await sorobanClient.getAccount(dummyAccount).catch(() => {
        // If dummy account doesn't exist, create Account with sequence 0
        return new Account(dummyAccount, '0');
      });

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: CONFIG.networkPassphrase,
      })
        .addOperation(this.contract.call('get_batch', ...params))
        .setTimeout(30)
        .build();

      const simulated = await sorobanClient.simulateTransaction(tx.toXDR());

      if (rpc.Api.isSimulationError(simulated)) {
        console.error('Batch not found:', simulated.error);
        return null;
      }

      // Parse result from simulation
      const result = simulated.result?.retval;
      if (!result) return null;

      return this.parseBatchData(result);
    } catch (error) {
      console.error('Failed to get batch:', error);
      return null;
    }
  }

  /**
   * Submit signed transaction and wait for confirmation
   */
  async submitSignedTx(signedXdr: string): Promise<TransactionResult> {
    const sendResponse = await sorobanClient.submitTransaction(signedXdr);

    if (sendResponse.status === 'ERROR') {
      throw new Error(`Transaction failed: ${sendResponse.errorResult}`);
    }

    // Wait for confirmation
    const txHash = sendResponse.hash;
    const confirmed = await sorobanClient.waitForTransaction(txHash);

    if (confirmed.status === 'FAILED') {
      throw new Error('Transaction failed on chain');
    }

    return {
      txHash,
      ledger: 'ledger' in confirmed ? confirmed.ledger : 0,
      status: 'success',
    };
  }

  // Helper methods

  private mapTipoResiduoToSymbol(tipo: TipoResiduo): string {
    const map: Record<TipoResiduo, string> = {
      'PET': 'PET',
      'vidrio': 'vidrio',
      'cartón': 'carton',  // Contract uses 'carton' without accent
      'metal': 'metal',
    };
    return map[tipo];
  }

  private mapSymbolToTipoResiduo(symbol: string): TipoResiduo {
    const map: Record<string, TipoResiduo> = {
      'PET': 'PET',
      'vidrio': 'vidrio',
      'carton': 'cartón',
      'metal': 'metal',
    };
    return map[symbol] || 'PET';
  }

  private mapEstadoSymbol(symbol: string): EstadoLote {
    const map: Record<string, EstadoLote> = {
      'pendiente': 'pendiente',
      'transito': 'en_transito',
      'acopio': 'en_acopio',
      'reciclado': 'reciclado',
      'comprado': 'comprado',
    };
    return map[symbol] || 'pendiente';
  }

  private parseBatchData(scVal: xdr.ScVal): BatchData {
    const native = scValToNative(scVal);

    return {
      batch_id: native.batch_id.toString(),
      tipo_residuo: this.mapSymbolToTipoResiduo(native.tipo_residuo),
      peso_kg: native.peso_kg,
      peso_recibido: native.peso_recibido || 0,
      kg_reciclados: native.kg_reciclados || 0,
      estado: this.mapEstadoSymbol(native.estado),
      owner_actual: native.owner_actual,
      empresa_origen: native.empresa_origen,
      tokens_grt: native.tokens_grt || 0,
      created_at: new Date(native.created_at * 1000).toISOString(),
      updated_at: new Date(native.updated_at * 1000).toISOString(),
    };
  }
}

// Export singleton instance
export const batchRegistryContract = new BatchRegistryContract();
