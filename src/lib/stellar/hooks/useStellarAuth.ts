import { useState, useCallback } from 'react';
import { freighterService } from '../client/freighter';
import { supabase } from '@/integrations/supabase/client';
import { CONFIG, CURRENT_NETWORK } from '../config';
import { classifyError } from '../utils/error-handler';
import { StellarError } from '../contracts/contract-types';
import type { Rol, Usuario } from '@/lib/types';

export function useStellarAuth() {
  const [state, setState] = useState({
    walletAddress: null as string | null,
    isConnecting: false,
    isRegistering: false,
    error: null as StellarError | null,
  });

  const [userProfile, setUserProfile] = useState<Usuario | null>(null);

  /**
   * Connect Freighter wallet
   */
  const connectWallet = useCallback(async () => {
    setState(s => ({ ...s, isConnecting: true, error: null }));

    try {
      // 1. Check Freighter installed
      const isInstalled = await freighterService.isInstalled();
      if (!isInstalled) {
        throw new Error('FREIGHTER_NOT_INSTALLED');
      }

      // 2. Request access (opens Freighter popup)
      const publicKey = await freighterService.requestAccess();

      // 3. Verify network
      const networkCheck = await freighterService.checkNetwork(CONFIG.networkPassphrase);
      if (!networkCheck.isCorrect) {
        console.warn(`Wrong network. Expected: ${CONFIG.networkPassphrase}, Got: ${networkCheck.current}`);
        // Note: We'll allow connection but show warning in UI
      }

      setState(s => ({ ...s, walletAddress: publicKey, isConnecting: false }));

      // 4. Check if user already registered in Supabase
      const { data: existingUser, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', publicKey)
        .maybeSingle();

      if (queryError) {
        console.error('Failed to query user:', queryError);
      }

      if (existingUser) {
        setUserProfile(existingUser as Usuario);
        setState(s => ({ ...s, isRegistering: false }));
      } else {
        // New user - show registration form
        setState(s => ({ ...s, isRegistering: true }));
      }
    } catch (error: any) {
      const stellarError = classifyError(error);
      setState(s => ({ ...s, isConnecting: false, error: stellarError }));
    }
  }, []);

  /**
   * Register user role
   */
  const registerRole = useCallback(async (nombre: string, rol: Rol) => {
    if (!state.walletAddress) {
      throw new Error('Wallet not connected');
    }

    setState(s => ({ ...s, isRegistering: true, error: null }));

    try {
      // Save user profile to Supabase
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          wallet_address: state.walletAddress,
          nombre,
          rol,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setUserProfile(newUser as Usuario);
      setState(s => ({ ...s, isRegistering: false }));
    } catch (error: any) {
      const stellarError = classifyError(error);
      setState(s => ({ ...s, error: stellarError }));
      throw error;
    }
  }, [state.walletAddress]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    setState({
      walletAddress: null,
      isConnecting: false,
      isRegistering: false,
      error: null,
    });
    setUserProfile(null);
  }, []);

  /**
   * Check if account needs funding and provide helper
   */
  const checkAndFundAccount = useCallback(async () => {
    if (!state.walletAddress) return;

    try {
      const response = await fetch(`${CONFIG.horizonUrl}/accounts/${state.walletAddress}`);

      if (!response.ok && CURRENT_NETWORK !== 'testnet') {
        // Account not found, needs funding
        return {
          needsFunding: true,
          friendbotUrl: `${CONFIG.friendbotUrl}?addr=${state.walletAddress}`,
        };
      }

      return { needsFunding: false };
    } catch (error) {
      console.error('Failed to check account:', error);
      return { needsFunding: true, friendbotUrl: `${CONFIG.friendbotUrl}?addr=${state.walletAddress}` };
    }
  }, [state.walletAddress]);

  return {
    walletAddress: state.walletAddress,
    userProfile,
    isConnecting: state.isConnecting,
    isRegistering: state.isRegistering,
    error: state.error,
    connectWallet,
    registerRole,
    disconnect,
    checkAndFundAccount,
  };
}
