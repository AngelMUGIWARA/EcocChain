import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react'
import type { Usuario } from '@/types/database'
import { useWalletSession } from '@/hooks/useWalletSession'

// ─── Context type ─────────────────────────────────────────────────────────────

interface SessionContextValue {
  /** Usuario autenticado. Null si no está registrado o no hay wallet conectada. */
  usuario: Usuario | null
  /** Fuerza una nueva lectura de wallet + lookup en Supabase. */
  refetch: () => void
  /** Permite actualizar el usuario en el state global (ej: tras el registro). */
  setUsuario: (u: Usuario | null) => void
  loading: boolean
  error: string | null
}

const SessionContext = createContext<SessionContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { usuario: walletUsuario, loading, error, refetch } = useWalletSession()

  // Allow child components (e.g. registration form) to set the user directly
  // after calling `crearUsuario()` without needing a full refetch.
  const [overrideUsuario, setOverrideUsuario] = useState<Usuario | null | undefined>(
    undefined
  )

  const setUsuario = useCallback((u: Usuario | null) => {
    setOverrideUsuario(u)
  }, [])

  const usuario =
    overrideUsuario !== undefined ? overrideUsuario : walletUsuario

  return (
    <SessionContext.Provider
      value={{ usuario, loading, error, refetch, setUsuario }}
    >
      {children}
    </SessionContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Accede al usuario de sesión global.
 * Debe usarse dentro de <SessionProvider>.
 */
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSession debe usarse dentro de <SessionProvider>')
  }
  return ctx
}
