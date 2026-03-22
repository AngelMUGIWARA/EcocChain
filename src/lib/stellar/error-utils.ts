import { StellarError } from './contracts/contract-types';

/**
 * Extract a human-readable error message from any error type
 * Handles: StellarError, Error, string, unknown objects
 * Returns a safe string that will never be [object Object]
 */
export function getErrorMessage(error: unknown): string {
  // StellarError interface
  if (error && typeof error === 'object' && 'userMessage' in error) {
    const stellarErr = error as StellarError;
    return stellarErr.userMessage || stellarErr.message || 'Error desconocido';
  }

  // Standard Error instance
  if (error instanceof Error) {
    return error.message;
  }

  // String
  if (typeof error === 'string') {
    return error;
  }

  // Object with message property
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === 'string') {
      return msg;
    }
  }

  // Fallback: safe string conversion
  try {
    return JSON.stringify(error);
  } catch {
    return 'Error desconocido';
  }
}

/**
 * Log full error details for debugging
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
  if (error && typeof error === 'object') {
    if ('type' in error) {
      console.error('Error type:', (error as StellarError).type);
    }
    if ('message' in error) {
      console.error('Error message:', (error as StellarError).message);
    }
  }
}
