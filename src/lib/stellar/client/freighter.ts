import {
  isConnected,
  getAddress,
  requestAccess,
  signTransaction,
  getNetwork,
} from '@stellar/freighter-api';
import { StellarError, StellarErrorType } from '../contracts/contract-types';
import { CONFIG } from '../config';

export class FreighterService {
  /**
   * Check if Freighter extension is installed
   * v6: isConnected() returns { isConnected: boolean, error? }
   */
  async isInstalled(): Promise<boolean> {
    const result = await isConnected();
    if (result.error) return false;
    return result.isConnected;
  }

  /**
   * Check if user is already connected (has granted access)
   * v6: getAddress() returns { address: string, error? }
   */
  async isConnected(): Promise<boolean> {
    const result = await getAddress();
    return !result.error && !!result.address;
  }

  /**
   * Request access to user's wallet and get public key.
   * Opens Freighter popup for user approval.
   * v6: requestAccess() returns { address: string, error? }
   */
  async requestAccess(): Promise<string> {
    const result = await requestAccess();
    if (result.error) {
      const msg = result.error.message ?? '';
      if (msg.includes('User declined') || msg.includes('rejected')) {
        throw this.createError(StellarErrorType.USER_DECLINED);
      }
      throw this.createError(StellarErrorType.WALLET_NOT_CONNECTED, msg);
    }
    if (!result.address) {
      throw this.createError(StellarErrorType.WALLET_NOT_CONNECTED);
    }
    return result.address;
  }

  /**
   * Get public key of connected wallet (no popup if already connected)
   * v6: getAddress() returns { address: string, error? }
   */
  async getPublicKey(): Promise<string> {
    const result = await getAddress();
    if (result.error || !result.address) {
      throw this.createError(StellarErrorType.WALLET_NOT_CONNECTED);
    }
    return result.address;
  }

  /**
   * Get current network passphrase from Freighter
   * v6: getNetwork() returns { network, networkPassphrase, error? }
   */
  async getNetwork(): Promise<string> {
    const result = await getNetwork();
    if (result.error) {
      throw this.createError(StellarErrorType.NETWORK_ERROR);
    }
    return result.networkPassphrase;
  }

  /**
   * Check if Freighter is on correct network
   */
  async checkNetwork(expectedNetwork: string): Promise<{ isCorrect: boolean; current: string }> {
    const current = await this.getNetwork();
    return {
      isCorrect: current === expectedNetwork,
      current,
    };
  }

  /**
   * Sign transaction with Freighter.
   * Opens Freighter popup for user to review and sign.
   * v6: signTransaction() returns { signedTxXdr: string, signerAddress: string, error? }
   */
  async signTransaction(xdr: string, networkPassphrase?: string): Promise<string> {
    const result = await signTransaction(xdr, {
      networkPassphrase: networkPassphrase ?? CONFIG.networkPassphrase,
    });
    if (result.error) {
      const msg = result.error.message ?? '';
      if (msg.includes('User declined') || msg.includes('rejected')) {
        throw this.createError(StellarErrorType.USER_DECLINED);
      }
      throw this.createError(StellarErrorType.CONTRACT_ERROR, msg);
    }
    if (!result.signedTxXdr) {
      throw this.createError(StellarErrorType.USER_DECLINED);
    }
    return result.signedTxXdr;
  }

  /**
   * Create typed error with user-friendly message
   */
  private createError(type: StellarErrorType, technicalMessage?: string): StellarError {
    const userMessages: Record<StellarErrorType, string> = {
      FREIGHTER_NOT_INSTALLED: 'Necesitas instalar Freighter Wallet para usar esta aplicación',
      WALLET_NOT_CONNECTED: 'Por favor conecta tu wallet Freighter',
      USER_DECLINED: 'Transacción cancelada por el usuario',
      WRONG_NETWORK: 'Por favor cambia a Stellar Testnet en Freighter',
      INSUFFICIENT_BALANCE: 'Saldo insuficiente para pagar las comisiones de red',
      INVALID_STATE: 'Esta acción no está disponible para el estado actual del lote',
      UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
      CONTRACT_ERROR: 'Error en el contrato inteligente',
      NETWORK_ERROR: 'Error de red. Verifica tu conexión',
      TRANSACTION_TIMEOUT: 'La transacción tardó demasiado. Por favor intenta nuevamente',
    };

    return {
      type,
      message: technicalMessage || type,
      userMessage: userMessages[type],
      recoverable: type !== StellarErrorType.FREIGHTER_NOT_INSTALLED,
      retryAfter: type === StellarErrorType.NETWORK_ERROR ? 5000 : undefined,
    };
  }
}

// Export singleton instance
export const freighterService = new FreighterService();
