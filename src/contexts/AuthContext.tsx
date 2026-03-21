import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Rol, Usuario } from '@/lib/types';
import { isConnected, requestAccess } from '@stellar/freighter-api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user:             Usuario | null;
  isLoading:        boolean;        // verificando sesión al montar
  isConnecting:     boolean;        // operación en progreso
  isRegistering:    boolean;        // wallet nueva → ir a /register
  error:            string | null;
  // Estado de la wallet conectada (Freighter)
  connectedWallet:  string | null;  // Stellar public key confirmada por Freighter
  walletEmail:      string | null;  // email del usuario asociado a esa wallet (si existe)
}

interface AuthContextType extends AuthState {
  connectWallet:  () => Promise<void>;
  clearWallet:    () => void;
  login:          (email: string, password: string) => Promise<void>;
  register:       (nombre: string, rol: Rol, email: string, password: string, walletAddress?: string) => Promise<void>;
  switchRole:     (rol: Rol) => void;
  disconnect:     () => Promise<void>;
  clearError:     () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Helper: obtener clave pública de requestAccess ──────────────────────────
// Freighter v6 devuelve { address }, versiones anteriores { publicKey } o string

function extractPublicKey(result: unknown): string | null {
  if (typeof result === 'string' && result.startsWith('G')) return result;
  if (result && typeof result === 'object') {
    const r = result as Record<string, unknown>;
    if (typeof r.address === 'string' && r.address.startsWith('G')) return r.address;
    if (typeof r.publicKey === 'string' && r.publicKey.startsWith('G')) return r.publicKey;
    if (r.error) return null;
  }
  return null;
}

// ─── Helper: fetch profile from `users` table ────────────────────────────────

async function fetchProfile(authId: string): Promise<Usuario | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('users')
    .select('id, wallet_address, nombre, rol, created_at')
    .eq('auth_id', authId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Usuario;
}

// ─── Helper: fetch profile by wallet_address ─────────────────────────────────

async function fetchProfileByWallet(wallet: string): Promise<(Usuario & { email?: string }) | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('users')
    .select('id, wallet_address, nombre, rol, email, created_at')
    .eq('wallet_address', wallet)
    .maybeSingle();

  if (error || !data) return null;
  return data as Usuario & { email?: string };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:            null,
    isLoading:       true,
    isConnecting:    false,
    isRegistering:   false,
    error:           null,
    connectedWallet: null,
    walletEmail:     null,
  });

  // Restaurar sesión existente al montar
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState(s => ({ ...s, user: profile, isLoading: false }));
      } else {
        setState(s => ({ ...s, isLoading: false }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState(s => ({ ...s, user: profile, isLoading: false }));
        } else if (event === 'SIGNED_OUT') {
          setState(s => ({ ...s, user: null, isLoading: false }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Conectar Freighter ────────────────────────────────────────────────────

  const connectWallet = useCallback(async () => {
    setState(s => ({ ...s, isConnecting: true, error: null }));
    try {
      // 1. Verificar que la extensión está instalada
      const connResult = await isConnected();
      const installed =
        typeof connResult === 'boolean'
          ? connResult
          : (connResult as { isConnected?: boolean })?.isConnected ?? false;

      if (!installed) {
        throw new Error('Freighter no está instalado. Descárgalo en freighter.app');
      }

      // 2. Solicitar acceso (abre el popup de Freighter)
      const accessResult = await requestAccess();
      const publicKey = extractPublicKey(accessResult);
      const accessError = (accessResult as { error?: string })?.error;

      if (accessError) throw new Error(`Freighter: ${accessError}`);
      if (!publicKey)  throw new Error('No se pudo obtener la clave pública de Freighter');

      // 3. Buscar en la tabla users por wallet_address
      const userRow = await fetchProfileByWallet(publicKey);

      if (userRow) {
        // Wallet registrada → pasar email a LoginPage para el paso 2
        setState(s => ({
          ...s,
          isConnecting:    false,
          connectedWallet: publicKey,
          walletEmail:     userRow.email ?? null,
        }));
      } else {
        // Wallet nueva → ir a registro con la wallet pre-cargada
        setState(s => ({
          ...s,
          isConnecting:    false,
          isRegistering:   true,
          connectedWallet: publicKey,
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar wallet';
      setState(s => ({ ...s, isConnecting: false, error: msg }));
    }
  }, []);

  const clearWallet = useCallback(() => {
    setState(s => ({ ...s, connectedWallet: null, walletEmail: null, error: null }));
  }, []);

  // ── Login email/password ──────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, isConnecting: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const profile = await fetchProfile(data.user.id);
      if (!profile) throw new Error('Perfil no encontrado. Verifica que tu cuenta esté registrada correctamente.');

      setState(s => ({
        ...s,
        user:            profile,
        isConnecting:    false,
        connectedWallet: null,
        walletEmail:     null,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setState(s => ({ ...s, isConnecting: false, error: translateError(msg) }));
    }
  }, []);

  // ── Registro ──────────────────────────────────────────────────────────────

  const register = useCallback(async (
    nombre: string,
    rol: Rol,
    email: string,
    password: string,
    walletAddress?: string,
  ) => {
    setState(s => ({ ...s, isConnecting: true, error: null }));
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('No se pudo crear la cuenta. Intenta de nuevo.');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('users')
        .insert({
          auth_id:        data.user.id,
          nombre,
          rol,
          email,
          wallet_address: walletAddress ?? null,
        });
      if (insertError) throw insertError;

      const profile = await fetchProfile(data.user.id);
      setState(s => ({
        ...s,
        user:          profile,
        isConnecting:  false,
        isRegistering: false,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrarse';
      setState(s => ({ ...s, isConnecting: false, error: translateError(msg) }));
    }
  }, []);

  // ── Demo: cambiar rol ─────────────────────────────────────────────────────

  const switchRole = useCallback((rol: Rol) => {
    setState(s => ({ ...s, user: s.user ? { ...s.user, rol } : null }));
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────

  const disconnect = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, isLoading: false, isConnecting: false, isRegistering: false,
               error: null, connectedWallet: null, walletEmail: null });
  }, []);

  const clearError = useCallback(() => setState(s => ({ ...s, error: null })), []);

  return (
    <AuthContext.Provider value={{
      ...state,
      connectWallet, clearWallet,
      login, register,
      switchRole, disconnect, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos';
  if (msg.includes('Email not confirmed'))        return 'Confirma tu correo antes de iniciar sesión';
  if (msg.includes('User already registered'))    return 'Este correo ya está registrado';
  if (msg.includes('Password should be'))         return 'La contraseña debe tener al menos 6 caracteres';
  return msg;
}
