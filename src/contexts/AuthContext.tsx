import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Rol, Usuario } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: Usuario | null;
  session: Session | null;
  loading: boolean;
  isConnecting: boolean;
  error: string | null;
  clearError: () => void;
  connectedWallet: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, rol: Rol, email: string, password: string, walletAddress?: string) => Promise<void>;
  connectWallet: () => Promise<void>;
  switchRole: (rol: Rol) => void;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string): Promise<Usuario | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data as Usuario | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on mount — use it as the single source of truth
    // to avoid the double-fetch that happens when getSession() + onAuthStateChange both run.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Fetch profile only on relevant events (not TOKEN_REFRESHED) to avoid rate-limiting.
      // Skip if register() already set the user for this session.
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setUser(prev => {
          if (prev?.id === session.user.id) return prev; // already set, skip fetch
          fetchProfile(session.user.id).then(profile => setUser(profile));
          return prev;
        });
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsConnecting(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message ?? 'Error al iniciar sesión');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const register = useCallback(async (
    nombre: string,
    rol: Rol,
    email: string,
    password: string,
    walletAddress?: string,
  ) => {
    setIsConnecting(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('No se pudo crear la cuenta. Verifica tu correo si la confirmación está activa.');

      const { error: profileError } = await supabase.rpc('create_user_profile', {
        p_id:     data.user.id,
        p_nombre: nombre,
        p_rol:    rol,
        p_email:  email,
        p_wallet: walletAddress ?? null,
      });
      if (profileError) throw profileError;

      // Set profile immediately — onAuthStateChange will fire SIGNED_IN shortly after
      // but will skip fetchProfile because loading is already false and user is set.
      const now = new Date().toISOString();
      setUser({
        id: data.user.id,
        nombre,
        rol,
        email,
        wallet_address: walletAddress ?? null,
        company_name: null,
        tx_hash: null,
        created_at: now,
        updated_at: now,
      });
    } catch (err: any) {
      setError(err.message ?? 'Error al registrarse');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const { requestAccess } = await import('@stellar/freighter-api');
      const result = await requestAccess();
      const publicKey =
        typeof result === 'string'
          ? result
          : (result as { address?: string; publicKey?: string })?.address
            ?? (result as { address?: string; publicKey?: string })?.publicKey;
      if (publicKey) setConnectedWallet(publicKey);
    } catch {
      // Freighter not available or user rejected
    }
  }, []);

  const disconnect = useCallback(async () => {
    await supabase.auth.signOut();
    setConnectedWallet(null);
    setUser(null);
    setSession(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const switchRole = useCallback((_rol: Rol) => {
    console.warn('switchRole: one wallet = one role. Role switching is not supported.');
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isConnecting,
    error,
    clearError,
    connectedWallet,
    login,
    register,
    connectWallet,
    switchRole,
    disconnect,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
