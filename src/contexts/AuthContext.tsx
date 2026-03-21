import React, { createContext, useContext } from 'react';
import { Rol, Usuario } from '@/lib/types';
import { useStellarAuth } from '@/lib/stellar/hooks/useStellarAuth';

interface AuthContextType {
  user: Usuario | null;
  isConnecting: boolean;
  isRegistering: boolean;
  connectWallet: () => Promise<void>;
  register: (nombre: string, rol: Rol) => Promise<void>;
  switchRole: (rol: Rol) => void;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stellar = useStellarAuth();

  // Map Stellar hook to Auth context interface
  const value: AuthContextType = {
    user: stellar.userProfile,
    isConnecting: stellar.isConnecting,
    isRegistering: stellar.isRegistering,
    connectWallet: stellar.connectWallet,
    register: stellar.registerRole,
    switchRole: () => {
      // Role switching removed in real blockchain version
      // Each wallet = one user with one role
      console.warn('Role switching is not available in blockchain version');
    },
    disconnect: stellar.disconnect,
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
