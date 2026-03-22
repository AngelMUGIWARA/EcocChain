export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string | null
          nombre: string
          rol: 'empresa' | 'transportista' | 'acopio' | 'recicladora' | 'compradora'
          email: string | null
          company_name: string | null
          tx_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          wallet_address?: string | null
          nombre: string
          rol: 'empresa' | 'transportista' | 'acopio' | 'recicladora' | 'compradora'
          email?: string | null
          company_name?: string | null
          tx_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string | null
          nombre?: string
          rol?: 'empresa' | 'transportista' | 'acopio' | 'recicladora' | 'compradora'
          email?: string | null
          company_name?: string | null
          tx_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      batches: {
        Row: {
          id: string
          batch_id: string
          tipo_residuo: 'PET' | 'vidrio' | 'cartón' | 'metal'
          peso_kg: number
          peso_recibido: number
          kg_reciclados: number
          estado: 'pendiente' | 'en_transito' | 'en_acopio' | 'reciclado' | 'comprado'
          owner_actual: string
          empresa_origen: string
          tokens_grt: number
          creation_tx_hash: string
          last_tx_hash: string | null
          created_at: string
          updated_at: string
          indexed_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          tipo_residuo: 'PET' | 'vidrio' | 'cartón' | 'metal'
          peso_kg: number
          peso_recibido?: number
          kg_reciclados?: number
          estado: 'pendiente' | 'en_transito' | 'en_acopio' | 'reciclado' | 'comprado'
          owner_actual: string
          empresa_origen: string
          tokens_grt?: number
          creation_tx_hash: string
          last_tx_hash?: string | null
          created_at: string
          updated_at: string
          indexed_at?: string
        }
        Update: {
          id?: string
          batch_id?: string
          tipo_residuo?: 'PET' | 'vidrio' | 'cartón' | 'metal'
          peso_kg?: number
          peso_recibido?: number
          kg_reciclados?: number
          estado?: 'pendiente' | 'en_transito' | 'en_acopio' | 'reciclado' | 'comprado'
          owner_actual?: string
          empresa_origen?: string
          tokens_grt?: number
          creation_tx_hash?: string
          last_tx_hash?: string | null
          created_at?: string
          updated_at?: string
          indexed_at?: string
        }
        Relationships: []
      }
      transfers: {
        Row: {
          id: string
          batch_id: string
          de: string
          para: string
          accion: 'creado' | 'transferido' | 'confirmado' | 'comprado'
          peso_recibido: number | null
          kg_reciclados: number | null
          tokens_emitidos: number | null
          tx_hash: string
          ledger_number: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          batch_id: string
          de: string
          para: string
          accion: 'creado' | 'transferido' | 'confirmado' | 'comprado'
          peso_recibido?: number | null
          kg_reciclados?: number | null
          tokens_emitidos?: number | null
          tx_hash: string
          ledger_number?: number | null
          timestamp: string
        }
        Update: {
          id?: string
          batch_id?: string
          de?: string
          para?: string
          accion?: 'creado' | 'transferido' | 'confirmado' | 'comprado'
          peso_recibido?: number | null
          kg_reciclados?: number | null
          tokens_emitidos?: number | null
          tx_hash?: string
          ledger_number?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_batch'
            columns: ['batch_id']
            isOneToOne: false
            referencedRelation: 'batches'
            referencedColumns: ['batch_id']
          }
        ]
      }
      sync_status: {
        Row: {
          id: string
          last_synced_ledger: number
          last_synced_at: string
        }
        Insert: {
          id?: string
          last_synced_ledger: number
          last_synced_at?: string
        }
        Update: {
          id?: string
          last_synced_ledger?: number
          last_synced_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      create_user_profile: {
        Args: {
          p_id: string
          p_nombre: string
          p_rol: string
          p_email?: string | null
          p_wallet?: string | null
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Row']

export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update']

export type Enums<T extends keyof PublicSchema['Enums']> =
  PublicSchema['Enums'][T]
