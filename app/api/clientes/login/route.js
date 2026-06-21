import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    const { data, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('password', password)
      .single()

    if (error || !data) {
      return Response.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    return Response.json({ cliente: data })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}