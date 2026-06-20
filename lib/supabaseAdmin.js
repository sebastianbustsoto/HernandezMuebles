// Cliente para usar SOLO EN EL SERVIDOR (rutas API: app/api/.../route.js)
// Usa la "service role key", que ignora RLS — nunca importar este
// archivo desde un componente 'use client' ni exponer la key al navegador.
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
