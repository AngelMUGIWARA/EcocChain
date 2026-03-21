import { CONFIG } from '../config';

/**
 * Fund account using Friendbot (testnet/standalone only)
 * @param publicKey - Account public key to fund
 * @returns Promise that resolves when account is funded
 */
export async function fundAccountWithFriendbot(publicKey: string): Promise<void> {
  try {
    const response = await fetch(`${CONFIG.friendbotUrl}?addr=${publicKey}`);

    if (!response.ok) {
      throw new Error(`Friendbot request failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Account funded successfully:', result);
  } catch (error) {
    console.error('Failed to fund account:', error);
    throw new Error('No se pudo fondear la cuenta. Intenta nuevamente.');
  }
}

/**
 * Check if account has sufficient balance for operations
 * @param publicKey - Account public key
 * @param minimumBalance - Minimum XLM balance required (default: 2 XLM)
 * @returns Promise<boolean>
 */
export async function hasSufficientBalance(
  publicKey: string,
  minimumBalance: number = 2
): Promise<boolean> {
  try {
    const response = await fetch(`${CONFIG.horizonUrl}/accounts/${publicKey}`);

    if (!response.ok) {
      return false;
    }

    const account = await response.json();
    const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native');

    if (!xlmBalance) {
      return false;
    }

    return parseFloat(xlmBalance.balance) >= minimumBalance;
  } catch (error) {
    console.error('Failed to check balance:', error);
    return false;
  }
}

/**
 * Get XLM balance for account
 * @param publicKey - Account public key
 * @returns Promise<number> - Balance in XLM
 */
export async function getXLMBalance(publicKey: string): Promise<number> {
  try {
    const response = await fetch(`${CONFIG.horizonUrl}/accounts/${publicKey}`);

    if (!response.ok) {
      throw new Error('Account not found');
    }

    const account = await response.json();
    const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native');

    return xlmBalance ? parseFloat(xlmBalance.balance) : 0;
  } catch (error) {
    console.error('Failed to get balance:', error);
    return 0;
  }
}
