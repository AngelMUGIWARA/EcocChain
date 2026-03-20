import React, { createContext, useContext, useState, useCallback } from 'react';
import { Rol, Usuario, ROL_LABELS } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock-data';

interface AuthState {
  user: Usuario | null;
  isConnecting: boolean;
  isRegistering: boolean;
}

interface AuthContextType extends AuthState {
  connectWallet: () => void;
  register: (nombre: string, rol: Rol) => void;
  switchRole: (rol: Rol) => void;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isConnecting: false,
    isRegistering: false,
  });

  const connectWallet = useCallback(() => {
    setState(s => ({ ...s, isConnecting: true }));
    // Simulate wallet connection delay
    setTimeout(() => {
      setState(s => ({ ...s, isConnecting: false, isRegistering: true }));
    }, 1200);
  }, []);

  const register = useCallback((nombre: string, rol: Rol) => {
    const user = MOCK_USERS.find(u => u.rol === rol) || {
      id: 'u-new',
      wallet_address: 'GNEW...XXXX',
      nombre,
      rol,
      created_at: new Date().toISOString(),
    };
    setState({ user: { ...user, nombre }, isConnecting: false, isRegistering: false });
  }, []);

  const switchRole = useCallback((rol: Rol) => {
    const mockUser = MOCK_USERS.find(u => u.rol === rol);
    if (mockUser) {
      setState(s => ({ ...s, user: mockUser }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ user: null, isConnecting: false, isRegistering: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, connectWallet, register, switchRole, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
