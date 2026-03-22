export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      batches: {
        Row: {
          batch_id: string
          created_at: string
          creation_tx_hash: string
          empresa_origen: string
          estado: string
          id: string
          indexed_at: string | null
          kg_reciclados: number | null
          last_tx_hash: string | null
          owner_actual: string
          peso_kg: number
          peso_recibido: number | null
          tipo_residuo: string
          tokens_grt: number | null
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at: string
          creation_tx_hash: string
          empresa_origen: string
          estado: string
          id?: string
          indexed_at?: string | null
          kg_reciclados?: number | null
          last_tx_hash?: string | null
          owner_actual: string
          peso_kg: number
          peso_recibido?: number | null
          tipo_residuo: string
          tokens_grt?: number | null
          updated_at: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          creation_tx_hash?: string
          empresa_origen?: string
          estado?: string
          id?: string
          indexed_at?: string | null
          kg_reciclados?: number | null
          last_tx_hash?: string | null
          owner_actual?: string
          peso_kg?: number
          peso_recibido?: number | null
          tipo_residuo?: string
          tokens_grt?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      sync_status: {
        Row: {
          id: string
          last_synced_at: string
          last_synced_ledger: number
          sync_errors: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          last_synced_at?: string
          last_synced_ledger?: number
          sync_errors?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          last_synced_at?: string
          last_synced_ledger?: number
          sync_errors?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transfers: {
        Row: {
          accion: string
          batch_id: string
          de: string
          id: string
          indexed_at: string | null
          kg_reciclados: number | null
          ledger_number: number | null
          para: string
          peso_recibido: number | null
          timestamp: string
          tokens_emitidos: number | null
          tx_hash: string
        }
        Insert: {
          accion: string
          batch_id: string
          de: string
          id?: string
          indexed_at?: string | null
          kg_reciclados?: number | null
          ledger_number?: number | null
          para: string
          peso_recibido?: number | null
          timestamp: string
          tokens_emitidos?: number | null
          tx_hash: string
        }
        Update: {
          accion?: string
          batch_id?: string
          de?: string
          id?: string
          indexed_at?: string | null
          kg_reciclados?: number | null
          ledger_number?: number | null
          para?: string
          peso_recibido?: number | null
          timestamp?: string
          tokens_emitidos?: number | null
          tx_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_batch"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["batch_id"]
          },
        ]
      }
      users: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string
          nombre: string
          rol: string
          tx_hash: string | null
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre: string
          rol: string
          tx_hash?: string | null
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre?: string
          rol?: string
          tx_hash?: string | null
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
