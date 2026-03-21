import { describe, it, expect } from 'vitest';
import { classifyError, getRecoveryAction } from '@/lib/stellar/utils/error-handler';
import { StellarErrorType } from '@/lib/stellar/contracts/contract-types';

describe('classifyError', () => {
  it('devuelve USER_DECLINED para "User declined"', () => {
    const result = classifyError(new Error('User declined access'));
    expect(result.type).toBe(StellarErrorType.USER_DECLINED);
    expect(result.recoverable).toBe(true);
  });

  it('devuelve USER_DECLINED para "User rejected"', () => {
    const result = classifyError(new Error('User rejected the transaction'));
    expect(result.type).toBe(StellarErrorType.USER_DECLINED);
  });

  it('devuelve FREIGHTER_NOT_INSTALLED para "not installed"', () => {
    const result = classifyError(new Error('Extension not found or not installed'));
    expect(result.type).toBe(StellarErrorType.FREIGHTER_NOT_INSTALLED);
    expect(result.recoverable).toBe(false);
  });

  it('devuelve WALLET_NOT_CONNECTED para "not connected"', () => {
    const result = classifyError(new Error('Wallet is not connected'));
    expect(result.type).toBe(StellarErrorType.WALLET_NOT_CONNECTED);
    expect(result.recoverable).toBe(true);
  });

  it('devuelve UNAUTHORIZED para "Unauthorized"', () => {
    const result = classifyError(new Error('Unauthorized: incorrect role'));
    expect(result.type).toBe(StellarErrorType.UNAUTHORIZED);
  });

  it('devuelve INVALID_STATE para "Invalid state"', () => {
    const result = classifyError(new Error('Invalid state: batch must be in pendiente'));
    expect(result.type).toBe(StellarErrorType.INVALID_STATE);
  });

  it('devuelve INSUFFICIENT_BALANCE para "insufficient"', () => {
    const result = classifyError(new Error('Account has insufficient balance'));
    expect(result.type).toBe(StellarErrorType.INSUFFICIENT_BALANCE);
  });

  it('devuelve TRANSACTION_TIMEOUT para "timeout"', () => {
    const result = classifyError(new Error('Transaction timeout'));
    expect(result.type).toBe(StellarErrorType.TRANSACTION_TIMEOUT);
    expect(result.retryAfter).toBeUndefined();
  });

  it('devuelve NETWORK_ERROR para "network" y asigna retryAfter', () => {
    const result = classifyError(new Error('Network request failed'));
    expect(result.type).toBe(StellarErrorType.NETWORK_ERROR);
    expect(result.retryAfter).toBe(5000);
  });

  it('pasa sin modificar si ya es StellarError', () => {
    const original = {
      type: StellarErrorType.USER_DECLINED,
      message: 'already typed',
      userMessage: 'Transacción cancelada por el usuario',
      recoverable: true,
    };
    const result = classifyError(original);
    expect(result).toBe(original);
  });

  it('devuelve CONTRACT_ERROR para errores desconocidos', () => {
    const result = classifyError(new Error('something completely unknown happened'));
    expect(result.type).toBe(StellarErrorType.CONTRACT_ERROR);
    expect(result.userMessage).toBeTruthy();
  });

  it('incluye el mensaje técnico original', () => {
    const result = classifyError(new Error('User declined request'));
    expect(result.message).toContain('User declined');
  });
});

describe('getRecoveryAction', () => {
  it('FREIGHTER_NOT_INSTALLED devuelve instrucción de instalación', () => {
    const action = getRecoveryAction({
      type: StellarErrorType.FREIGHTER_NOT_INSTALLED,
      message: '',
      userMessage: '',
      recoverable: false,
    });
    expect(action).not.toBeNull();
    expect(action).toContain('Freighter');
  });

  it('WRONG_NETWORK devuelve instrucción de cambio de red', () => {
    const action = getRecoveryAction({
      type: StellarErrorType.WRONG_NETWORK,
      message: '',
      userMessage: '',
      recoverable: true,
    });
    expect(action).not.toBeNull();
    expect(action).toContain('Testnet');
  });

  it('INVALID_STATE devuelve null (sin acción de recovery)', () => {
    const action = getRecoveryAction({
      type: StellarErrorType.INVALID_STATE,
      message: '',
      userMessage: '',
      recoverable: true,
    });
    expect(action).toBeNull();
  });

  it('INSUFFICIENT_BALANCE menciona Friendbot', () => {
    const action = getRecoveryAction({
      type: StellarErrorType.INSUFFICIENT_BALANCE,
      message: '',
      userMessage: '',
      recoverable: true,
    });
    expect(action).not.toBeNull();
    expect(action).toContain('Friendbot');
  });
});
