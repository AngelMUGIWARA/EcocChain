// ─── Tipos de dominio para EcoChain ──────────────────────────────────────────
// Este archivo es la fuente autoritativa de todos los tipos del esquema.
// src/lib/types.ts re-exporta desde aquí para compatibilidad con código existente.

export type Rol =
  | 'empresa'
  | 'transportista'
  | 'acopio'
  | 'recicladora'
  | 'compradora'

export type EstadoLote =
  | 'pendiente'
  | 'en_transito'
  | 'en_acopio'
  | 'reciclado'
  | 'comprado'

export type TipoResiduo = 'PET' | 'vidrio' | 'carton' | 'metal'

export type AccionTransferencia = 'creado' | 'transferido' | 'confirmado' | 'comprado'

// ─── Tabla: usuarios ──────────────────────────────────────────────────────────
export interface Usuario {
  id: string
  wallet_address: string
  nombre: string
  rol: Rol
  created_at: string
}

// ─── Tabla: lotes ─────────────────────────────────────────────────────────────
export interface Lote {
  id: string
  batch_id: string
  tipo_residuo: TipoResiduo
  peso_kg: number
  peso_recibido: number | null
  kg_reciclados: number | null
  estado: EstadoLote
  owner_actual: string | null
  empresa_origen: string | null
  compradora_id: string | null
  tokens_grt: number
  tx_hash: string | null
  created_at: string
  updated_at: string
}

// ─── Tabla: transferencias ────────────────────────────────────────────────────
export interface Transferencia {
  id: string
  lote_id: string
  de: string | null
  para: string | null
  accion: AccionTransferencia
  tx_hash: string | null
  timestamp: string
}

// ─── Vista: v_timeline_lote ───────────────────────────────────────────────────
export interface TimelineItem {
  id: string
  lote_id: string
  batch_id: string
  tipo_residuo: TipoResiduo
  peso_kg: number
  tokens_grt: number
  de_nombre: string | null
  de_rol: Rol | null
  para_nombre: string | null
  para_rol: Rol | null
  accion: AccionTransferencia
  tx_hash: string | null
  timestamp: string
}
