// Re-exports from the authoritative type source.
// All new code should import from '@/types/database' directly.
// This file is kept for backwards compatibility with existing components.
export type {
  Rol,
  EstadoLote,
  TipoResiduo,
  AccionTransferencia,
  Usuario,
  Lote,
  Transferencia,
  TimelineItem,
} from '@/types/database'

// ─── UI utility constants (not in database.ts) ────────────────────────────────
import type { Rol as RolType, EstadoLote as EstadoLoteType, TipoResiduo as TipoResiduoType } from '@/types/database'

export const ROL_LABELS: Record<RolType, string> = {
  empresa: 'Empresa Generadora',
  transportista: 'Transportista',
  acopio: 'Centro de Acopio',
  recicladora: 'Planta Recicladora',
  compradora: 'Empresa Compradora',
}

export const ESTADO_LABELS: Record<EstadoLoteType, string> = {
  pendiente: 'Pendiente',
  en_transito: 'En Tránsito',
  en_acopio: 'En Acopio',
  reciclado: 'Reciclado',
  comprado: 'Comprado',
}

export const TIPO_RESIDUO_OPTIONS: TipoResiduoType[] = ['PET', 'vidrio', 'carton', 'metal']
