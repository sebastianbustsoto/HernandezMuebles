import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    console.log('🔍 Buscando usuario por email:', email)

    let query = supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('email', email.toLowerCase().trim())

    if (password && password !== '') {
      query = query.eq('password', password)
    }

    const { data, error } = await query.single()

    if (error) {
      console.error('❌ Error en consulta:', error)
      return Response.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    if (!data) {
      console.log('❌ Usuario no encontrado')
      return Response.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    console.log('✅ Usuario encontrado ID:', data.id, 'Email:', data.email)
    return Response.json({ cliente: data })
  } catch (err) {
    console.error('❌ Error en login:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}