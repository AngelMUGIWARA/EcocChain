import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { EstadoLote, Lote } from '@/types/database'
import { getLotesByEstado, getLotesByOwner } from '@/lib/supabase/queries'

export interface LotesRealtimeOptions {
  /** Filtrar por estado (opcional) */
  estado?: EstadoLote
  /** Filtrar por owner_actual (opcional) */
  owner_actual?: string
}

export interface LotesRealtimeResult {
  lotes: Lote[]
  loading: boolean
}

/**
 * Suscripción en tiempo real a la tabla `lotes`.
 *
 * - Carga inicial según los filtros proporcionados.
 * - Se actualiza automáticamente ante INSERT / UPDATE / DELETE en Supabase.
 * - Llama a `supabase.removeChannel(channel)` en el cleanup del useEffect
 *   para evitar memory leaks.
 */
export function useLotesRealtime(
  options: LotesRealtimeOptions = {}
): LotesRealtimeResult {
  const { estado, owner_actual } = options
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)

  // Keep stable references so the effect doesn't re-run on every render
  const estadoRef = useRef(estado)
  const ownerRef = useRef(owner_actual)
  estadoRef.current = estado
  ownerRef.current = owner_actual

  const cargarLotes = useCallback(async () => {
    setLoading(true)
    try {
      let data: Lote[] = []

      if (estadoRef.current) {
        data = await getLotesByEstado(estadoRef.current)
      } else if (ownerRef.current) {
        data = await getLotesByOwner(ownerRef.current)
      } else {
        // Sin filtros: trae todos los lotes
        const result = await supabase
          .from('lotes')
          .select('*')
          .order('updated_at', { ascending: false })
        if (result.error) {
          throw new Error(`[Supabase] useLotesRealtime: ${result.error.message}`)
        }
        data = (result.data ?? []) as Lote[]
      }

      setLotes(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, []) // stable — uses refs internally

  useEffect(() => {
    cargarLotes()

    // Build a unique channel name based on the filters
    const channelName = [
      'lotes-realtime',
      estado ?? 'all',
      owner_actual ?? 'all',
    ].join('-')

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lotes',
          // Note: Supabase Realtime filter syntax for server-side filtering
          ...(owner_actual ? { filter: `owner_actual=eq.${owner_actual}` } : {}),
        },
        () => {
          // Re-fetch on any change to keep data consistent
          cargarLotes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // Only re-subscribe when the filter values actually change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, owner_actual])

  return { lotes, loading }
}
