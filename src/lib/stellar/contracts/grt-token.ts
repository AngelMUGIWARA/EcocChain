import {
  Contract,
  rpc,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  Address,
  Account,
} from '@stellar/stellar-sdk';
import { CONFIG, CONTRACT_IDS } from '../config';
import { sorobanClient } from '../client/soroban-client';

export class GRTTokenContract {
  private contract: Contract;

  constructor() {
    if (!CONTRACT_IDS.grtToken) {
      throw new Error('GRT Token contract ID not configured');
    }
    this.contract = new Contract(CONTRACT_IDS.grtToken);
  }

  /**
   * Get GRT token balance for an address (read-only)
   */
  async getBalance(address: string): Promise<number> {
    try {
      const params = [new Address(address).toScVal()];

      // Dummy account for read-only call
      const dummyAccount = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
      const account = await sorobanClient.getAccount(dummyAccount).catch(() => {
        return new Account(dummyAccount, '0');
      });

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: CONFIG.networkPassphrase,
      })
        .addOperation(this.contract.call('balance', ...params))
        .setTimeout(30)
        .build();

      const simulated = await sorobanClient.simulateTransaction(tx.toXDR());

      if (rpc.Api.isSimulationError(simulated)) {
        console.error('Failed to get balance:', simulated.error);
        return 0;
      }

      const result = simulated.result?.retval;
      if (!result) return 0;

      // Parse i128 balance and convert to token units (divide by 10^7)
      const balanceRaw = scValToNative(result) as bigint;
      return Number(balanceRaw) / 10_000_000;
    } catch (error) {
      console.error('Failed to get GRT balance:', error);
      return 0;
    }
  }

  /**
   * Build transaction to transfer GRT tokens
   */
  async buildTransferTx(
    from: string,
    to: string,
    amount: number
  ): Promise<string> {
    const account = await sorobanClient.getAccount(from);

    // Convert amount to token units (multiply by 10^7)
    const amountRaw = amount * 10_000_000;

    const params = [
      new Address(from).toScVal(),
      new Address(to).toScVal(),
      nativeToScVal(amountRaw, { type: 'i128' }),
    ];

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: CONFIG.networkPassphrase,
    })
      .addOperation(this.contract.call('transfer', ...params))
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
   * Get total supply of GRT tokens
   */
  async getTotalSupply(): Promise<number> {
    try {
      const dummyAccount = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
      const account = await sorobanClient.getAccount(dummyAccount).catch(() => {
        return new Account(dummyAccount, '0');
      });

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: CONFIG.networkPassphrase,
      })
        .addOperation(this.contract.call('total_supply'))
        .setTimeout(30)
        .build();

      const simulated = await sorobanClient.simulateTransaction(tx.toXDR());

      if (rpc.Api.isSimulationError(simulated)) {
        return 0;
      }

      const result = simulated.result?.retval;
      if (!result) return 0;

      const totalRaw = scValToNative(result) as bigint;
      return Number(totalRaw) / 10_000_000;
    } catch (error) {
      console.error('Failed to get total supply:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const grtTokenContract = new GRTTokenContract();
