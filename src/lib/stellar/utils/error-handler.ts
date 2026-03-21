import { StellarErrorType, StellarError } from '../contracts/contract-types';

export const ERROR_MESSAGES: Record<StellarErrorType, string> = {
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

/**
 * Classify any error into a typed StellarError with user-friendly message
 */
export function classifyError(error: any): StellarError {
  // Check if already a StellarError
  if (error.type && error.userMessage) {
    return error as StellarError;
  }

  // Parse error message
  const errorMsg = error?.message || error?.toString() || 'Unknown error';

  // Freighter specific errors
  if (errorMsg.includes('User declined') || errorMsg.includes('User rejected')) {
    return createError(StellarErrorType.USER_DECLINED, errorMsg);
  }

  if (errorMsg.includes('not installed') || errorMsg.includes('Extension not found')) {
    return createError(StellarErrorType.FREIGHTER_NOT_INSTALLED, errorMsg);
  }

  if (errorMsg.includes('not connected')) {
    return createError(StellarErrorType.WALLET_NOT_CONNECTED, errorMsg);
  }

  // Network errors
  if (errorMsg.includes('network') || errorMsg.includes('Network')) {
    return createError(StellarErrorType.NETWORK_ERROR, errorMsg);
  }

  // Contract specific errors
  if (errorMsg.includes('Unauthorized') || errorMsg.includes('incorrect role')) {
    return createError(StellarErrorType.UNAUTHORIZED, errorMsg);
  }

  if (errorMsg.includes('Invalid state') || errorMsg.includes('must be')) {
    return createError(StellarErrorType.INVALID_STATE, errorMsg);
  }

  if (errorMsg.includes('insufficient') || errorMsg.includes('balance')) {
    return createError(StellarErrorType.INSUFFICIENT_BALANCE, errorMsg);
  }

  // Timeout
  if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
    return createError(StellarErrorType.TRANSACTION_TIMEOUT, errorMsg);
  }

  // Generic contract error
  if (errorMsg.includes('contract') || errorMsg.includes('invoke')) {
    return createError(StellarErrorType.CONTRACT_ERROR, errorMsg);
  }

  // Default to contract error for unknown cases
  return createError(StellarErrorType.CONTRACT_ERROR, errorMsg);
}

function createError(type: StellarErrorType, technicalMessage: string): StellarError {
  return {
    type,
    message: technicalMessage,
    userMessage: ERROR_MESSAGES[type],
    recoverable: type !== StellarErrorType.FREIGHTER_NOT_INSTALLED,
    retryAfter: type === StellarErrorType.NETWORK_ERROR ? 5000 : undefined,
  };
}

export function getRecoveryAction(error: StellarError): string | null {
  switch (error.type) {
    case StellarErrorType.FREIGHTER_NOT_INSTALLED:
      return 'Instala Freighter desde https://www.freighter.app';
    case StellarErrorType.WALLET_NOT_CONNECTED:
      return 'Haz clic en "Conectar Wallet"';
    case StellarErrorType.WRONG_NETWORK:
      return 'Abre Freighter y cambia a Stellar Testnet';
    case StellarErrorType.INSUFFICIENT_BALANCE:
      return 'Fondea tu cuenta usando Friendbot';
    case StellarErrorType.USER_DECLINED:
      return 'Intenta la transacción nuevamente';
    case StellarErrorType.NETWORK_ERROR:
      return 'Verifica tu conexión a internet';
    case StellarErrorType.TRANSACTION_TIMEOUT:
      return 'Intenta nuevamente';
    default:
      return null;
  }
}
