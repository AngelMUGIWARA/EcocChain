import {
  rpc,
  TransactionBuilder,
  Contract,
  Account,
  Operation,
  Networks,
  BASE_FEE,
  xdr,
} from '@stellar/stellar-sdk';
import { CONFIG, CURRENT_NETWORK } from '../config';

export class SorobanClient {
  private server: rpc.Server;

  constructor() {
    this.server = new rpc.Server(CONFIG.sorobanRpcUrl, {
      allowHttp: CONFIG.sorobanRpcUrl.startsWith('http://'),
    });
  }

  /**
   * Get Soroban RPC server instance
   */
  getServer(): rpc.Server {
    return this.server;
  }

  /**
   * Get latest ledger information
   */
  async getLatestLedger(): Promise<rpc.Api.GetLatestLedgerResponse> {
    return await this.server.getLatestLedger();
  }

  /**
   * Get account from network
   */
  async getAccount(publicKey: string): Promise<Account> {
    const accountResponse = await fetch(`${CONFIG.horizonUrl}/accounts/${publicKey}`);

    if (!accountResponse.ok) {
      throw new Error('Account not found or not funded');
    }

    const accountData = await accountResponse.json();
    return new Account(accountData.id, accountData.sequence);
  }

  /**
   * Simulate transaction to get accurate fees and validate
   */
  async simulateTransaction(xdr: string): Promise<rpc.Api.SimulateTransactionResponse> {
    const transaction = TransactionBuilder.fromXDR(xdr, CONFIG.networkPassphrase);
    return await this.server.simulateTransaction(transaction);
  }

  /**
   * Submit signed transaction to network
   */
  async submitTransaction(signedXdr: string): Promise<rpc.Api.SendTransactionResponse> {
    const transaction = TransactionBuilder.fromXDR(signedXdr, CONFIG.networkPassphrase);
    return await this.server.sendTransaction(transaction);
  }

  /**
   * Wait for transaction to be confirmed
   * @param txHash - Transaction hash
   * @param timeout - Timeout in milliseconds (default: 60 seconds)
   */
  async waitForTransaction(
    txHash: string,
    timeout: number = 60000
  ): Promise<rpc.Api.GetTransactionResponse> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const response = await this.server.getTransaction(txHash);

      if (response.status === 'SUCCESS' || response.status === 'FAILED') {
        return response;
      }

      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Transaction timeout');
  }

  /**
   * Get contract events
   */
  async getEvents(filters: {
    contractIds?: string[];
    startLedger?: number;
    limit?: number;
  }): Promise<rpc.Api.GetEventsResponse> {
    return await this.server.getEvents({
      filters: filters.contractIds?.map(id => ({
        type: 'contract' as const,
        contractIds: [id],
      })) || [],
      startLedger: filters.startLedger,
      limit: filters.limit || 100,
    });
  }
}

// Export singleton instance
export const sorobanClient = new SorobanClient();
