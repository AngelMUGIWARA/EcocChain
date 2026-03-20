import { useState, useCallback, useEffect } from 'react'
import type { Usuario } from '@/types/database'
import { getUsuarioByWallet } from '@/lib/supabase/queries'

export interface WalletSession {
  usuario: Usuario | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Reads the connected wallet from Freighter, then looks up the user in Supabase.
 *
 * - If Freighter is not installed → error: "Freighter no instalado"
 * - If wallet is connected but not registered → usuario = null
 *   (the app should show the registration screen)
 * - Exposes `refetch` to re-run the lookup after registration
 */
export function useWalletSession(): WalletSession {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Freighter injects window.freighter
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const freighter = (window as any).freighter

      if (!freighter) {
        setError('Freighter no instalado')
        setUsuario(null)
        return
      }

      // Freighter API v1: getPublicKey()
      const wallet_address: string = await freighter.getPublicKey()

      if (!wallet_address) {
        setError('No se pudo obtener la wallet_address de Freighter')
        setUsuario(null)
        return
      }

      const found = await getUsuarioByWallet(wallet_address)
      setUsuario(found)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
      setUsuario(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  return { usuario, loading, error, refetch: fetchSession }
}
