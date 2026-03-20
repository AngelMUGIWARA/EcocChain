import { Lote, Transferencia, Usuario } from './types';

export const MOCK_USERS: Usuario[] = [
  { id: 'u1', wallet_address: 'GDKP...R4MX', nombre: 'Envases del Bajío S.A.', rol: 'empresa', created_at: '2026-03-01T10:00:00Z' },
  { id: 'u2', wallet_address: 'GBTR...7KLN', nombre: 'Carlos Mendoza', rol: 'transportista', created_at: '2026-03-01T10:00:00Z' },
  { id: 'u3', wallet_address: 'GCAP...Q9WZ', nombre: 'Centro Norte Reciclaje', rol: 'acopio', created_at: '2026-03-01T10:00:00Z' },
  { id: 'u4', wallet_address: 'GRPL...M2DF', nombre: 'PET Procesados MX', rol: 'recicladora', created_at: '2026-03-01T10:00:00Z' },
  { id: 'u5', wallet_address: 'GCMP...8TVP', nombre: 'EcoPackaging Corp', rol: 'compradora', created_at: '2026-03-01T10:00:00Z' },
];

export const MOCK_LOTES: Lote[] = [
  {
    id: 'l1', batch_id: '0xa3f8...d41c', tipo_residuo: 'PET', peso_kg: 250, peso_recibido: 248,
    kg_reciclados: 230, estado: 'reciclado', owner_actual: 'u4', empresa_origen: 'u1',
    tokens_grt: 230, tx_hash: 'abc123def456', created_at: '2026-03-15T08:30:00Z', updated_at: '2026-03-18T11:20:00Z',
  },
  {
    id: 'l2', batch_id: '0xb7e2...f923', tipo_residuo: 'vidrio', peso_kg: 180, peso_recibido: 178,
    estado: 'en_acopio', owner_actual: 'u3', empresa_origen: 'u1',
    tokens_grt: 0, tx_hash: 'def789ghi012', created_at: '2026-03-16T09:15:00Z', updated_at: '2026-03-17T14:30:00Z',
  },
  {
    id: 'l3', batch_id: '0xc9d1...a5b7', tipo_residuo: 'cartón', peso_kg: 320,
    estado: 'en_transito', owner_actual: 'u2', empresa_origen: 'u1',
    tokens_grt: 0, tx_hash: 'ghi345jkl678', created_at: '2026-03-18T07:00:00Z', updated_at: '2026-03-18T14:15:00Z',
  },
  {
    id: 'l4', batch_id: '0xd2a4...c8e1', tipo_residuo: 'metal', peso_kg: 150,
    estado: 'pendiente', owner_actual: 'u1', empresa_origen: 'u1',
    tokens_grt: 0, tx_hash: 'jkl901mno234', created_at: '2026-03-19T10:45:00Z', updated_at: '2026-03-19T10:45:00Z',
  },
  {
    id: 'l5', batch_id: '0xe5f3...b2d9', tipo_residuo: 'PET', peso_kg: 400, peso_recibido: 395,
    kg_reciclados: 380, estado: 'comprado', owner_actual: 'u5', empresa_origen: 'u1',
    tokens_grt: 380, tx_hash: 'mno567pqr890', created_at: '2026-03-10T06:20:00Z', updated_at: '2026-03-14T16:00:00Z',
  },
];

export const MOCK_TRANSFERENCIAS: Transferencia[] = [
  { id: 't1', lote_id: 'l1', de: 'u1', para: 'u1', accion: 'creado', tx_hash: 'abc123def456', timestamp: '2026-03-15T08:30:00Z', de_nombre: 'Envases del Bajío S.A.', para_nombre: 'Envases del Bajío S.A.' },
  { id: 't2', lote_id: 'l1', de: 'u1', para: 'u2', accion: 'transferido', tx_hash: 'tx_transfer_1', timestamp: '2026-03-15T14:00:00Z', de_nombre: 'Envases del Bajío S.A.', para_nombre: 'Carlos Mendoza' },
  { id: 't3', lote_id: 'l1', de: 'u2', para: 'u3', accion: 'transferido', tx_hash: 'tx_transfer_2', timestamp: '2026-03-16T09:44:00Z', de_nombre: 'Carlos Mendoza', para_nombre: 'Centro Norte Reciclaje' },
  { id: 't4', lote_id: 'l1', de: 'u3', para: 'u4', accion: 'transferido', tx_hash: 'tx_transfer_3', timestamp: '2026-03-17T10:00:00Z', de_nombre: 'Centro Norte Reciclaje', para_nombre: 'PET Procesados MX' },
  { id: 't5', lote_id: 'l1', de: 'u4', para: 'u4', accion: 'confirmado', tx_hash: 'tx_recycle_1', timestamp: '2026-03-18T11:20:00Z', de_nombre: 'PET Procesados MX', para_nombre: 'PET Procesados MX' },
];
