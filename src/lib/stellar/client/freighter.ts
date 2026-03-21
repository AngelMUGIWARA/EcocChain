import { isConnected, getPublicKey, signTransaction, getNetwork } from '@stellar/freighter-api';
import { StellarError, StellarErrorType } from '../contracts/contract-types';

export class FreighterService {
  /**
   * Check if Freighter extension is installed
   */
  async isInstalled(): Promise<boolean> {
    return await isConnected();
  }

  /**
   * Check if user is already connected (has granted access)
   */
  async isConnected(): Promise<boolean> {
    try {
      await getPublicKey();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Request access to user's wallet and get public key
   * This will open Freighter popup for user approval
   */
  async requestAccess(): Promise<string> {
    try {
      const publicKey = await getPublicKey();
      return publicKey;
    } catch (error: any) {
      if (error.message?.includes('User declined')) {
        throw this.createError(StellarErrorType.USER_DECLINED);
      }
      throw this.createError(StellarErrorType.WALLET_NOT_CONNECTED);
    }
  }

  /**
   * Get public key of connected wallet (no popup if already connected)
   */
  async getPublicKey(): Promise<string> {
    try {
      return await getPublicKey();
    } catch (error) {
      throw this.createError(StellarErrorType.WALLET_NOT_CONNECTED);
    }
  }

  /**
   * Get current network from Freighter
   * Returns network passphrase string
   */
  async getNetwork(): Promise<string> {
    try {
      return await getNetwork();
    } catch (error) {
      throw this.createError(StellarErrorType.NETWORK_ERROR);
    }
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
   * Sign transaction with Freighter
   * This will open Freighter popup for user to review and sign
   * @param xdr - Transaction XDR string to sign
   * @param network - Network passphrase
   * @returns Signed transaction XDR string
   */
  async signTransaction(xdr: string, network?: string): Promise<string> {
    try {
      const signedXdr = await signTransaction(xdr, {
        network: network || undefined, // If not provided, uses current network
      });
      return signedXdr;
    } catch (error: any) {
      if (error.message?.includes('User declined')) {
        throw this.createError(StellarErrorType.USER_DECLINED);
      }
      throw this.createError(StellarErrorType.CONTRACT_ERROR, error.message);
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
}

// Export singleton instance
export const freighterService = new FreighterService();
