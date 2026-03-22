export type Rol = 'empresa' | 'transportista' | 'acopio' | 'recicladora' | 'compradora';

export type EstadoLote = 'pendiente' | 'en_transito' | 'en_acopio' | 'reciclado' | 'comprado';

export type TipoResiduo = 'PET' | 'vidrio' | 'cartón' | 'metal';

export interface Usuario {
  id: string;
  wallet_address: string | null;
  nombre: string;
  rol: Rol;
  email: string | null;
  company_name: string | null;
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lote {
  id: string;
  batch_id: string;
  tipo_residuo: TipoResiduo;
  peso_kg: number;
  peso_recibido?: number;
  kg_reciclados?: number;
  estado: EstadoLote;
  owner_actual: string;
  empresa_origen: string;
  tokens_grt: number;
  tx_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface Transferencia {
  id: string;
  lote_id: string;
  de: string;
  para: string;
  accion: 'creado' | 'transferido' | 'confirmado' | 'comprado';
  tx_hash?: string;
  timestamp: string;
  // Joined data
  de_nombre?: string;
  para_nombre?: string;
}

export const ROL_LABELS: Record<Rol, string> = {
  empresa: 'Empresa Generadora',
  transportista: 'Transportista',
  acopio: 'Centro de Acopio',
  recicladora: 'Planta Recicladora',
  compradora: 'Empresa Compradora',
};

export const ESTADO_LABELS: Record<EstadoLote, string> = {
  pendiente: 'Pendiente',
  en_transito: 'En Tránsito',
  en_acopio: 'En Acopio',
  reciclado: 'Reciclado',
  comprado: 'Comprado',
};

export const TIPO_RESIDUO_OPTIONS: TipoResiduo[] = ['PET', 'vidrio', 'cartón', 'metal'];
