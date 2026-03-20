import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY'
  )
}

/**
 * Instancia única del cliente Supabase.
 * Importar siempre desde aquí:
 *   import { supabase } from '@/lib/supabase/client'
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // No usamos Supabase Auth — la sesión se maneja por wallet_address
    persistSession: false,
    autoRefreshToken: false,
  },
})
