// Freighter API v6 — all functions return result objects, not raw values
import {
  isConnected,
  getAddress,
  getNetwork,
  signTransaction,
  requestAccess as freighterRequestAccess,
} from '@stellar/freighter-api';
import { StellarError, StellarErrorType } from '../contracts/contract-types';
import { logError } from '../error-utils';

export class FreighterService {
  /**
   * Check if Freighter extension is installed and available.
   * v6: isConnected() returns { isConnected: boolean, error? }
   * Also checks window.freighter as a direct fallback.
   */
  async isInstalled(): Promise<boolean> {
    try {
      // Direct check: Freighter injects window.freighter when installed
      if (typeof window !== 'undefined' && (window as Record<string, unknown>)['freighter']) {
        return true;
      }
      const result = await isConnected();
      return result.isConnected ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Check if user has already granted access (address retrievable without popup).
   * v6: getAddress() returns { address: string, error? }
   */
  async isConnected(): Promise<boolean> {
    try {
      const result = await getAddress();
      return !!result.address && !result.error;
    } catch {
      return false;
    }
  }

  /**
   * Request access to user's wallet and get public key.
   * v6: requestAccess() opens the Freighter popup for user approval.
   * Returns { address, error? }.
   */
  async requestAccess(): Promise<string> {
    try {
      // Use requestAccess (shows popup) — NOT getAddress (silent, no popup)
      const result = await freighterRequestAccess();
      if (result.error) {
        const msg = result.error.message ?? String(result.error);
        logError('FreighterService.requestAccess', result.error);
        if (msg.toLowerCase().includes('user declined') || msg.toLowerCase().includes('rejected')) {
          throw this.createError(StellarErrorType.USER_DECLINED);
        }
        throw this.createError(StellarErrorType.WALLET_NOT_CONNECTED);
      }
      if (!result.address) {
        throw this.createError(StellarErrorType.WALLET_NOT_CONNECTED);
      }
      return result.address;
    } catch (error) {
      if (this.isStellarError(error)) throw error;
      logError('FreighterService.requestAccess', error);
      throw this.createError(StellarErrorType.WALLET_NOT_CONNECTED);
    }
  }

  /**
   * Get public key of connected wallet (no popup if already connected).
   * v6: getAddress() returns { address, error? }
   */
  async getPublicKey(): Promise<string> {
    try {
      const result = await getAddress();
      if (result.error || !result.address) {
        throw this.createError(StellarErrorType.WALLET_NOT_CONNECTED);
      }
      return result.address;
    } catch (error) {
      if (this.isStellarError(error)) throw error;
      logError('FreighterService.getPublicKey', error);
      throw this.createError(StellarErrorType.WALLET_NOT_CONNECTED);
    }
  }

  /**
   * Get current network passphrase from Freighter.
   * v6: getNetwork() returns { network, networkPassphrase, error? }
   * `network` = short name e.g. "TESTNET"
   * `networkPassphrase` = full string e.g. "Test SDF Network ; September 2015"
   */
  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    try {
      const result = await getNetwork();
      if (result.error) {
        throw this.createError(StellarErrorType.NETWORK_ERROR);
      }
      return { network: result.network, networkPassphrase: result.networkPassphrase };
    } catch (error) {
      if (this.isStellarError(error)) throw error;
      logError('FreighterService.getNetwork', error);
      throw this.createError(StellarErrorType.NETWORK_ERROR);
    }
  }

  /**
   * Check if Freighter is on the correct network.
   * Accepts both short name (TESTNET) and full passphrase.
   */
  async checkNetwork(expectedPassphrase: string): Promise<{ isCorrect: boolean; current: string }> {
    const { network, networkPassphrase } = await this.getNetwork();
    console.info('[FreighterService.checkNetwork]', { network, networkPassphrase, expectedPassphrase });

    // Match against either the passphrase or the short name (e.g. "TESTNET")
    const passphraseMatch = networkPassphrase === expectedPassphrase;
    const shortNameMatch = network.toUpperCase() === 'TESTNET' &&
      expectedPassphrase === 'Test SDF Network ; September 2015';

    return {
      isCorrect: passphraseMatch || shortNameMatch,
      current: networkPassphrase || network,
    };
  }

  /**
   * Sign transaction with Freighter (opens popup for user review).
   * v6: signTransaction(xdr, { networkPassphrase }) returns { signedTxXdr, signerAddress, error? }
   * NOTE: v5 used `network` key; v6 uses `networkPassphrase`.
   */
  async signTransaction(xdr: string, networkPassphrase?: string): Promise<string> {
    try {
      const opts = networkPassphrase ? { networkPassphrase } : {};
      const result = await signTransaction(xdr, opts);

      if (result.error) {
        const msg = result.error.message ?? String(result.error);
        logError('FreighterService.signTransaction', result.error);
        if (msg.toLowerCase().includes('user declined') || msg.toLowerCase().includes('rejected')) {
          throw this.createError(StellarErrorType.USER_DECLINED);
        }
        throw this.createError(StellarErrorType.CONTRACT_ERROR, msg);
      }

      // v6 returns signedTxXdr (not signedTransaction like in v5)
      return result.signedTxXdr;
    } catch (error) {
      if (this.isStellarError(error)) throw error;
      logError('FreighterService.signTransaction', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.toLowerCase().includes('user declined') || errorMsg.toLowerCase().includes('rejected')) {
        throw this.createError(StellarErrorType.USER_DECLINED);
      }
      throw this.createError(StellarErrorType.CONTRACT_ERROR, errorMsg);
    }
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

  private isStellarError(error: unknown): error is StellarError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      'userMessage' in error
    );
  }
}

// Export singleton instance
export const freighterService = new FreighterService();
