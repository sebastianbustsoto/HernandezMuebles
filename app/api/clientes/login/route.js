import { supabaseAdmin } from '@/lib/supabaseAdmin'

// POST /api/clientes/login
export async function POST(req) {
  const { email, password } = await req.json()
  
  if (!email || !password) {
    return Response.json({ error: 'Correo y contraseña son requeridos.' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('email', String(email).toLowerCase().trim())
      .eq('password', password)
      .single()

    if (error) {
      return Response.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 })
    }

    return Response.json({
      success: true,
      cliente: {
        id: data.id,
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono,
        is_admin: data.is_admin
      }
    })
  } catch (err) {
    return Response.json({ error: 'Error en login' }, { status: 500 })
  }
}
