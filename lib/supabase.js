// Cliente para usar EN EL NAVEGADOR (componentes 'use client')
// Usa la clave "anon" — segura para exponer al público,
// las tablas quedan protegidas por RLS (Row Level Security).
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
