import { supabaseAdmin } from '@/lib/supabaseAdmin'

// POST /api/clientes/login — { email, password }
export async function POST(req) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return Response.json({ error: 'Correo y contraseña son requeridos.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('clientes')
    .select('*')
    .eq('email', String(email).toLowerCase().trim())
    .eq('password', password)
    .maybeSingle()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) return Response.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 })

  return Response.json({ cliente: data })
}
