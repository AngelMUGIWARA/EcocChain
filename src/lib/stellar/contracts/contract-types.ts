import { Rol, EstadoLote, TipoResiduo } from '@/types/database';

// Stellar-specific types
export interface StellarError {
  type: StellarErrorType;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryAfter?: number;
}

export enum StellarErrorType {
  FREIGHTER_NOT_INSTALLED = 'FREIGHTER_NOT_INSTALLED',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  USER_DECLINED = 'USER_DECLINED',
  WRONG_NETWORK = 'WRONG_NETWORK',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_STATE = 'INVALID_STATE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TRANSACTION_TIMEOUT = 'TRANSACTION_TIMEOUT',
}

export interface TransactionResult {
  txHash: string;
  ledger: number;
  status: 'success' | 'failed';
}

export interface BatchResult extends TransactionResult {
  batchId: string;
}

// Smart contract data types (matching Soroban contract)
export interface BatchData {
  batch_id: string;
  tipo_residuo: TipoResiduo;
  peso_kg: number;
  peso_recibido?: number;
  kg_reciclados?: number;
  estado: EstadoLote;
  owner_actual: string;
  empresa_origen: string;
  tokens_grt: number;
  created_at: string;
  updated_at: string;
}

export interface ContractCallOptions {
  source: string;
  fee?: string;
  timeout?: number;
}
