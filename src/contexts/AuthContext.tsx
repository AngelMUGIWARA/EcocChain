import React, { createContext, useContext, useState } from 'react';
import { Rol, Usuario } from '@/lib/types';
import { useStellarAuth } from '@/lib/stellar/hooks/useStellarAuth';

interface AuthContextType {
  user: Usuario | null;
  isConnecting: boolean;
  isRegistering: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  register: (nombre: string, rol: Rol) => Promise<void>;
  switchRole: (rol: Rol) => void;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stellar = useStellarAuth();
  const [demoRol, setDemoRol] = useState<Rol | null>(null);

  // Map Stellar hook to Auth context interface
  const value: AuthContextType = {
    user: stellar.userProfile
      ? { ...stellar.userProfile, rol: demoRol ?? stellar.userProfile.rol }
      : null,
    isConnecting: stellar.isConnecting,
    isRegistering: stellar.isRegistering,
    error: stellar.error?.userMessage ?? null,
    connectWallet: stellar.connectWallet,
    register: stellar.registerRole,
    switchRole: (rol: Rol) => setDemoRol(rol),
    disconnect: () => { setDemoRol(null); stellar.disconnect(); },
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
