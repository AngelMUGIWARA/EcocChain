import { supabase } from '@/lib/supabase/client'
import type {
  Rol,
  EstadoLote,
  TipoResiduo,
  AccionTransferencia,
  Usuario,
  Lote,
  Transferencia,
  TimelineItem,
} from '@/types/database'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function throwOnError<T>(
  result: { data: T | null; error: { message: string } | null },
  contexto: string
): T {
  if (result.error) {
    throw new Error(`[Supabase] ${contexto}: ${result.error.message}`)
  }
  if (result.data === null) {
    throw new Error(`[Supabase] ${contexto}: no se recibió data`)
  }
  return result.data
}

// ─── Usuarios ─────────────────────────────────────────────────────────────────

/**
 * Busca usuario por wallet. Retorna null si no existe (flujo de registro).
 */
export async function getUsuarioByWallet(
  wallet_address: string
): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('wallet_address', wallet_address)
    .maybeSingle()

  if (error) {
    throw new Error(`[Supabase] getUsuarioByWallet: ${error.message}`)
  }
  return data as Usuario | null
}

/**
 * Crea un nuevo usuario al registrarse por primera vez.
 */
export async function crearUsuario(
  wallet_address: string,
  nombre: string,
  rol: Rol
): Promise<Usuario> {
  const result = await supabase
    .from('usuarios')
    .insert({ wallet_address, nombre, rol })
    .select()
    .single()

  return throwOnError(result, 'crearUsuario') as Usuario
}

// ─── Lotes ────────────────────────────────────────────────────────────────────

/**
 * Todos los lotes en un estado dado (ej: 'pendiente' para transportista).
 */
export async function getLotesByEstado(estado: EstadoLote): Promise<Lote[]> {
  const result = await supabase
    .from('lotes')
    .select('*')
    .eq('estado', estado)
    .order('created_at', { ascending: false })

  return throwOnError(result, `getLotesByEstado(${estado})`) as Lote[]
}

/**
 * Lotes donde owner_actual = owner_id (mis lotes actuales).
 */
export async function getLotesByOwner(owner_id: string): Promise<Lote[]> {
  const result = await supabase
    .from('lotes')
    .select('*')
    .eq('owner_actual', owner_id)
    .order('updated_at', { ascending: false })

  return throwOnError(result, `getLotesByOwner(${owner_id})`) as Lote[]
}

/**
 * Lotes creados originalmente por esta empresa.
 */
export async function getLotesByEmpresaOrigen(
  empresa_id: string
): Promise<Lote[]> {
  const result = await supabase
    .from('lotes')
    .select('*')
    .eq('empresa_origen', empresa_id)
    .order('created_at', { ascending: false })

  return throwOnError(result, `getLotesByEmpresaOrigen(${empresa_id})`) as Lote[]
}

/**
 * Busca un lote por el hash del contrato Soroban.
 */
export async function getLoteByBatchId(
  batch_id: string
): Promise<Lote | null> {
  const { data, error } = await supabase
    .from('lotes')
    .select('*')
    .eq('batch_id', batch_id)
    .maybeSingle()

  if (error) {
    throw new Error(`[Supabase] getLoteByBatchId: ${error.message}`)
  }
  return data as Lote | null
}

/**
 * Crea un lote nuevo tras llamar createWasteBatch en Soroban.
 */
export async function crearLote(datos: {
  batch_id: string
  tipo_residuo: TipoResiduo
  peso_kg: number
  owner_actual: string
  empresa_origen: string
  tx_hash: string
}): Promise<Lote> {
  const result = await supabase
    .from('lotes')
    .insert({
      batch_id: datos.batch_id,
      tipo_residuo: datos.tipo_residuo,
      peso_kg: datos.peso_kg,
      owner_actual: datos.owner_actual,
      empresa_origen: datos.empresa_origen,
      tx_hash: datos.tx_hash,
      estado: 'pendiente',
    })
    .select()
    .single()

  return throwOnError(result, 'crearLote') as Lote
}

/**
 * Actualiza estado, owner, peso u otros campos tras cada TX en Stellar.
 */
export async function actualizarLote(
  id: string,
  cambios: Partial<Omit<Lote, 'id' | 'created_at'>>
): Promise<Lote> {
  const result = await supabase
    .from('lotes')
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  return throwOnError(result, `actualizarLote(${id})`) as Lote
}

// ─── Transferencias ───────────────────────────────────────────────────────────

/**
 * Registra un evento en el historial del lote.
 */
export async function registrarTransferencia(datos: {
  lote_id: string
  de: string | null
  para: string
  accion: AccionTransferencia
  tx_hash: string
}): Promise<Transferencia> {
  const result = await supabase
    .from('transferencias')
    .insert({
      lote_id: datos.lote_id,
      de: datos.de,
      para: datos.para,
      accion: datos.accion,
      tx_hash: datos.tx_hash,
    })
    .select()
    .single()

  return throwOnError(result, 'registrarTransferencia') as Transferencia
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

/**
 * Usa la vista v_timeline_lote. Retorna todos los eventos de un lote en orden.
 */
export async function getTimelineLote(lote_id: string): Promise<TimelineItem[]> {
  const result = await supabase
    .from('v_timeline_lote')
    .select('*')
    .eq('lote_id', lote_id)
    .order('timestamp', { ascending: true })

  return throwOnError(result, `getTimelineLote(${lote_id})`) as TimelineItem[]
}
