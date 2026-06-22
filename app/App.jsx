'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE_ID = 'service_23yygw2'
const EMAILJS_PUBLIC_KEY = 'Q0uWNPkx9jZqdtmTU'
const EMAILJS_TEMPLATE_OTP = 'template_bqfb7tf'
const EMAILJS_TEMPLATE_TRANSACCIONAL = 'template_szq30sf'

const EMAILJS_TEMPLATE_COTIZACION = EMAILJS_TEMPLATE_TRANSACCIONAL
const EMAILJS_TEMPLATE_CONFIRMACION = EMAILJS_TEMPLATE_TRANSACCIONAL

const EMAILJS_TEMPLATE_REGISTRO = EMAILJS_TEMPLATE_OTP
const EMAILJS_TEMPLATE_RECUPERAR = EMAILJS_TEMPLATE_OTP

const ETAPAS = ['cotización', 'fabricación', 'entrega', 'entregado']
const ETAPA_LABEL = {
  cotización: 'Cotización',
  fabricación: 'Fabricación',
  entrega: 'Entrega',
  entregado: 'Entregado',
}
const ETAPA_COLOR = {
  cotización: '#1a1a1a',
  fabricación: '#333333',
  entrega: '#7a4f9a',
  entregado: '#2e7d32',
}
const ADMIN_EMAIL = 'noreply.hernandezmuebles@gmail.com'

const MDF_GROSORES = ['MDF melamínico 9 mm (Blanco)', 'MDF melamínico 18 mm (Blanco)']
const TIPOS_MUEBLE = ['Escritorio', 'Cocina', 'Baño', 'Otro']

function getSaludo() {
  const h = new Date().getHours()
  return h < 12 ? 'días' : h < 19 ? 'tardes' : 'noches'
}

function generarCódigo(nombres, apellidos, número) {
  const n = new Date()
  const dd = String(n.getDate()).padStart(2, '0')
  const mm = String(n.getMonth() + 1).padStart(2, '0')
  const iN = (nombres || '').trim().charAt(0).toUpperCase()
  const iA = (apellidos || '').trim().charAt(0).toUpperCase()
  const digitos = String(número || '').replace(/\D/g, '').slice(-2)
  return dd + mm + iN + iA + digitos
}

function formatPhone(raw) {
  const prefix = '+56 9 '
  let d = String(raw || '').replace(/\D/g, '')
  if (d.startsWith('569')) d = d.slice(3)
  d = d.slice(0, 8)
  return prefix + d.slice(0, 4) + (d.length > 4 ? ' ' + d.slice(4, 8) : '')
}

function generarOTP() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function Btn({ children, onClick, outline, small, full, danger, disabled, style = {} }) {
  const base = {
    background: danger ? '#c62828' : outline ? 'transparent' : '#1a1a1a',
    color: outline ? '#1a1a1a' : '#fff',
    border: outline ? '1.5px solid #1a1a1a' : 'none',
    padding: small ? '7px 11px' : '11px 20px',
    borderRadius: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: small ? 12 : 14,
    fontWeight: 700,
    width: full ? '100%' : 'auto',
    opacity: disabled ? 0.55 : 1,
    transition: 'background .15s',
    ...style,
  }
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={base}
      onMouseEnter={(e) => {
        if (!disabled)
          e.currentTarget.style.background = danger
            ? '#b71c1c'
            : outline
            ? 'rgba(26,26,26,.12)'
            : '#000000'
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          e.currentTarget.style.background = danger
            ? '#c62828'
            : outline
            ? 'transparent'
            : '#1a1a1a'
      }}
    >
      {children}
    </button>
  )
}

function Field({ label, id, type = 'text', value, onChange, placeholder, invalid, disabled, rows, style = {} }) {
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${invalid ? '#c62828' : 'rgba(217,217,217,.7)'}`,
    borderRadius: 10,
    fontSize: 14,
    background: invalid ? 'rgba(255,235,238,.92)' : 'rgba(255,255,255,.70)',
    color: '#222',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: invalid ? '0 0 0 3px rgba(198,40,40,.18)' : 'none',
    opacity: disabled ? 0.55 : 1,
    ...style,
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: '#444' }}>
          {label}
        </label>
      )}
      {rows ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={inputStyle}
        />
      )}
    </div>
  )
}

function Card({ children, style = {}, warm, className = '' }) {
  return (
    <div
      className={className}
      style={{
        background: warm ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.55)',
        border: warm ? '1px solid rgba(0,0,0,.30)' : '1px solid rgba(255,255,255,.60)',
        borderRadius: 16,
        backdropFilter: 'blur(8px)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Modal({ onClose, children, maxW = 440 }) {
  return (
    <div
      className="anim-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.45)',
        zIndex: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="anim-pop"
        style={{
          background: 'rgba(255,255,255,.97)',
          borderRadius: 20,
          padding: 28,
          maxWidth: maxW,
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,.2)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function ModalAuth({ onClose, onLogin, onRegister, onResetPassword }) {
  const [tab, setTab] = useState('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [err, setErr] = useState('')
  const [regNombres, setRegNombres] = useState('')
  const [regApellidos, setRegApellidos] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regTel, setRegTel] = useState('+56 9 ')
  const [regPass, setRegPass] = useState('')
  const [regErr, setRegErr] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [otpSent, setOtpSent] = useState('')
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', ''])
  const [otpErr, setOtpErr] = useState('')
  const [sending, setSending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotErr, setForgotErr] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotOtpSent, setForgotOtpSent] = useState('')
  const [forgotOtpInputs, setForgotOtpInputs] = useState(['', '', '', '', '', ''])
  const [forgotNewPass, setForgotNewPass] = useState('')
  const [forgotNewPass2, setForgotNewPass2] = useState('')
  const [forgotSending, setForgotSending] = useState(false)
  const [forgotCooldown, setForgotCooldown] = useState(0)
  const [forgotOk, setForgotOk] = useState(false)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  useEffect(() => {
    if (forgotCooldown <= 0) return
    const t = setInterval(() => setForgotCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [forgotCooldown])

  function doLogin() {
    const e = loginEmail.trim().toLowerCase(),
      p = loginPass.trim()
    if (!e || !p) {
      setErr('Completa todos los campos')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setErr('Ingresa un correo electrónico válido (debe contener @).')
      return
    }
    fetch('/api/clientes/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e, password: p }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.cliente) {
          onLogin(data.cliente)
        } else {
          setErr(data.error || 'Correo o contraseña incorrectos')
        }
      })
      .catch(() => setErr('Error al conectar con el servidor'))
  }

  function validateRegFields() {
    if (!regNombres.trim() || !regApellidos.trim() || !regEmail.trim() || !regPass.trim()) {
      setRegErr('Completa todos los campos')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setRegErr('Ingresa un correo electrónico válido (debe contener @).')
      return false
    }
    if (regPass.length < 4) {
      setRegErr('La contraseña debe tener al menos 4 carácteres')
      return false
    }
    return true
  }

  async function sendVerificationCode() {
  const code = generarOTP()
  setOtpSent(code)
  setOtpErr('')
  setSending(true)
  
  // ✅ LOGS PARA DEPURAR
  console.log('📧 Enviando email con:')
  console.log('  Service ID:', EMAILJS_SERVICE_ID)
  console.log('  Template ID:', EMAILJS_TEMPLATE_REGISTRO)
  console.log('  Public Key:', EMAILJS_PUBLIC_KEY)
  console.log('  To:', regEmail.trim().toLowerCase())
  console.log('  Code:', code)
  
  try {
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_REGISTRO,
      {
        passcode: code,
        time: '15 minutos',
        email: regEmail.trim().toLowerCase(),
        to_name: regNombres.trim(),
        to_email: regEmail.trim().toLowerCase(),
        from_name: 'Hernández Muebles',
        reply_to: ADMIN_EMAIL,
        subject: 'Código de verificación — Hernández Muebles',
        message: `Hola ${regNombres.trim()},\n\nTu código de verificación es:\n\n${code}\n\nIngresa este código para confirmar tu correo y activar tu cuenta.\n\nSi no solicitaste esto, ignora este mensaje.\n\nHernández Muebles`,
        codigo: code,
      },
      EMAILJS_PUBLIC_KEY
    )
    console.log('✅ EmailJS respuesta:', result)
  } catch (err) {
    console.error('❌ EmailJS error completo:', err)
    console.error('  Status:', err.status)
    console.error('  Text:', err.text)
  } finally {
    setSending(false)
    setResendCooldown(30)
  }
}

  async function doRegisterStart() {
    if (!validateRegFields()) return
    setRegErr('')
    setOtpInputs(['', '', '', '', '', ''])
    setVerifying(true)
    await sendVerificationCode()
  }

  function handleOtpChange(i, val) {
    const v = val.replace(/\D/g, '').slice(-1)
    setOtpInputs((prev) => {
      const next = [...prev]
      next[i] = v
      return next
    })
    setOtpErr('')
    if (v && i < 5) {
      const nextEl = document.getElementById(`otp-${i + 1}`)
      nextEl?.focus()
    }
  }

  function handleOtpKeyDown(i, e) {
    if (e.key === 'Backspace' && !otpInputs[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus()
    }
  }

  async function confirmOtp() {
    const code = otpInputs.join('')
    if (code.length !== 6) {
      setOtpErr('Ingresa los 6 dígitos del código.')
      return
    }
    if (code !== otpSent) {
      setOtpErr('El código ingresado es incorrecto.')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/clientes/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: regNombres.trim(),
          apellidos: regApellidos.trim(),
          email: regEmail.trim().toLowerCase(),
          password: regPass.trim(),
          telefono: regTel || '',
        }),
      })
      const data = await res.json()
      if (data.cliente) {
        onRegister(data.cliente)
      } else {
        setOtpErr(data.error || 'Error al registrar usuario')
      }
    } catch (error) {
      console.error('Error registrando:', error)
      setOtpErr('Error al conectar con el servidor')
    } finally {
      setSending(false)
    }
  }

  async function sendForgotCode() {
    const e = forgotEmail.trim().toLowerCase()
    setForgotErr('')
    if (!e) {
      setForgotErr('Ingresa tu correo electrónico.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setForgotErr('Ingresa un correo electrónico válido.')
      return
    }
    try {
      const res = await fetch('/api/clientes/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, password: '' }),
      })
      const data = await res.json()
      if (!data.cliente) {
        setForgotErr('No encontramos una cuenta con ese correo.')
        return
      }
    } catch {
      setForgotErr('Error al verificar el correo.')
      return
    }
    const code = generarOTP()
    setForgotOtpSent(code)
    setForgotOtpInputs(['', '', '', '', '', ''])
    setForgotSending(true)
    try {
      if (EMAILJS_TEMPLATE_RECUPERAR !== 'TU_TEMPLATE_RECUPERAR') {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_RECUPERAR,
          {
            passcode: code,
            time: '15 minutos',
            email: e,
            to_name: forgotEmail.trim().split('@')[0],
            to_email: e,
            from_name: 'Hernández Muebles',
            reply_to: ADMIN_EMAIL,
            subject: 'Recupera tu contraseña — Hernández Muebles',
            message: `Hola,\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nTu código de verificación es:\n\n${code}\n\nIngresa este código para crear una nueva contraseña.\n\nSi no solicitaste esto, ignora este mensaje.\n\nHernández Muebles`,
            codigo: code,
          },
          EMAILJS_PUBLIC_KEY
        )
      } else {
        console.warn('[EmailJS no configurado] Código de recuperación:', code)
        alert(`⚠️ EmailJS no está configurado todavía.\nTu código de prueba es: ${code}`)
      }
      setForgotSent(true)
    } catch (err) {
      console.error('EmailJS error:', err)
      setForgotErr('No se pudo enviar el correo. Intenta nuevamente.')
    } finally {
      setForgotSending(false)
      setForgotCooldown(30)
    }
  }

  function handleForgotOtpChange(i, val) {
    const v = val.replace(/\D/g, '').slice(-1)
    setForgotOtpInputs((prev) => {
      const next = [...prev]
      next[i] = v
      return next
    })
    setForgotErr('')
    if (v && i < 5) document.getElementById(`forgot-otp-${i + 1}`)?.focus()
  }

  function handleForgotOtpKeyDown(i, e) {
    if (e.key === 'Backspace' && !forgotOtpInputs[i] && i > 0)
      document.getElementById(`forgot-otp-${i - 1}`)?.focus()
  }

  async function confirmResetPassword() {
    const code = forgotOtpInputs.join('')
    if (code.length !== 6) {
      setForgotErr('Ingresa los 6 dígitos del código.')
      return
    }
    if (code !== forgotOtpSent) {
      setForgotErr('El código ingresado es incorrecto.')
      return
    }
    if (forgotNewPass.length < 4) {
      setForgotErr('La nueva contraseña debe tener al menos 4 carácteres.')
      return
    }
    if (forgotNewPass !== forgotNewPass2) {
      setForgotErr('Las contraseñas no coinciden.')
      return
    }
    setForgotErr('')
    onResetPassword(forgotEmail.trim().toLowerCase(), forgotNewPass)
    setForgotOk(true)
  }

  function backToLogin() {
    setForgotMode(false)
    setForgotSent(false)
    setForgotOk(false)
    setForgotEmail('')
    setForgotErr('')
    setForgotNewPass('')
    setForgotNewPass2('')
    setForgotOtpInputs(['', '', '', '', '', ''])
  }

  const Tab = ({ id, label }) => (
    <button
      onClick={() => {
        setTab(id)
        setErr('')
        setRegErr('')
        setVerifying(false)
      }}
      style={{
        flex: 1,
        padding: 8,
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 700,
        background: tab === id ? '#1a1a1a' : 'transparent',
        color: tab === id ? '#fff' : '#666',
        transition: 'all .2s',
      }}
    >
      {label}
    </button>
  )

  if (forgotMode) {
    if (forgotOk) {
      return (
        <Modal onClose={onClose}>
          <div className="anim-fade-up" style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
            <h3 style={{ fontSize: 19, marginBottom: 8 }}>Contraseña actualizada</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
              Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión con tu nueva
              contraseña.
            </p>
            <Btn full onClick={backToLogin}>
              Ir a iniciar sesión
            </Btn>
          </div>
        </Modal>
      )
    }
    return (
      <Modal onClose={onClose}>
        <div
          className="anim-fade-up"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 800 }}>Recuperar contraseña</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#888' }}
          >
            ✕
          </button>
        </div>
        {!forgotSent ? (
          <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
              Ingresa el correo con el que te registraste. Te enviaremos un código de 6 dígitos para
              crear una nueva contraseña.
            </p>
            {forgotErr && (
              <div
                className="anim-shake"
                style={{
                  background: 'rgba(198,40,40,.1)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 13,
                  color: '#c62828',
                }}
              >
                {forgotErr}
              </div>
            )}
            <Field
              label="Correo electrónico"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="correo@ejemplo.cl"
            />
            <Btn full onClick={sendForgotCode} disabled={forgotSending}>
              {forgotSending ? 'Enviando código...' : 'Enviar código'}
            </Btn>
            <button
              onClick={backToLogin}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#1a1a1a',
                fontWeight: 700,
                fontSize: 12,
                alignSelf: 'center',
              }}
            >
              ← Volver a iniciar sesión
            </button>
          </div>
        ) : (
          <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
              Enviamos un código de 6 dígitos a <b>{forgotEmail.trim().toLowerCase()}</b>. Ingrésalo
              junto con tu nueva contraseña.
            </p>
            <div className={`otp-row${forgotErr ? ' anim-shake' : ''}`}>
              {forgotOtpInputs.map((v, i) => (
                <input
                  key={i}
                  id={`forgot-otp-${i}`}
                  className="otp-box"
                  maxLength={1}
                  inputMode="numeric"
                  value={v}
                  onChange={(e) => handleForgotOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleForgotOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <Field
              label="Nueva contraseña"
              type="password"
              value={forgotNewPass}
              onChange={(e) => setForgotNewPass(e.target.value)}
              placeholder="Mínimo 4 carácteres"
            />
            <Field
              label="Confirmar nueva contraseña"
              type="password"
              value={forgotNewPass2}
              onChange={(e) => setForgotNewPass2(e.target.value)}
              placeholder="••••"
            />
            {forgotErr && (
              <div
                className="anim-shake"
                style={{
                  background: 'rgba(198,40,40,.1)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 13,
                  color: '#c62828',
                }}
              >
                {forgotErr}
              </div>
            )}
            <Btn full onClick={confirmResetPassword}>
              Restablecer contraseña
            </Btn>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
              <button
                onClick={backToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#1a1a1a',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                ← Volver
              </button>
              <button
                onClick={sendForgotCode}
                disabled={forgotSending || forgotCooldown > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: forgotCooldown > 0 ? 'default' : 'pointer',
                  color: forgotCooldown > 0 ? '#aaa' : '#1a1a1a',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {forgotSending
                  ? 'Enviando...'
                  : forgotCooldown > 0
                  ? `Reenviar (${forgotCooldown}s)`
                  : 'Reenviar código'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    )
  }

  if (verifying) {
    return (
      <Modal onClose={onClose}>
        <div
          className="anim-fade-up"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 800 }}>Verifica tu correo</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#888' }}
          >
            ✕
          </button>
        </div>
        <p className="anim-fade-up" style={{ fontSize: 13, color: '#666', marginBottom: 18, lineHeight: 1.6 }}>
          Enviamos un código de 6 dígitos a <b>{regEmail.trim().toLowerCase()}</b>. Ingrésalo para
          activar tu cuenta.
        </p>
        <div className={`anim-fade-up otp-row${otpErr ? ' anim-shake' : ''}`} style={{ marginBottom: 14 }}>
          {otpInputs.map((v, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              className="otp-box"
              maxLength={1}
              inputMode="numeric"
              value={v}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>
        {otpErr && (
          <div
            className="anim-fade-up"
            style={{
              background: 'rgba(198,40,40,.1)',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 13,
              color: '#c62828',
              marginBottom: 12,
            }}
          >
            {otpErr}
          </div>
        )}
        <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn full onClick={confirmOtp}>
            Verificar y crear cuenta
          </Btn>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#888' }}>
            <button
              onClick={() => setVerifying(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#1a1a1a',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              ← Volver
            </button>
            <button
              onClick={sendVerificationCode}
              disabled={sending || resendCooldown > 0}
              style={{
                background: 'none',
                border: 'none',
                cursor: resendCooldown > 0 ? 'default' : 'pointer',
                color: resendCooldown > 0 ? '#aaa' : '#1a1a1a',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {sending
                ? 'Enviando...'
                : resendCooldown > 0
                ? `Reenviar (${resendCooldown}s)`
                : 'Reenviar código'}
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>Acceso</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#888' }}
        >
          ✕
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,.06)', borderRadius: 10, padding: 4, marginBottom: 16 }}>
        <Tab id="login" label="Iniciar sesión" />
        <Tab id="register" label="Registrarse" />
      </div>
      {tab === 'login' && (
        <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {err && (
            <div
              className="anim-shake"
              style={{
                background: 'rgba(198,40,40,.1)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                color: '#c62828',
              }}
            >
              {err}
            </div>
          )}
          <Field
            label="Correo electrónico"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="correo@ejemplo.cl"
          />
          <Field
            label="Contraseña"
            type="password"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            placeholder="••••"
          />
          <button
            onClick={() => setForgotMode(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1a1a1a',
              fontWeight: 700,
              fontSize: 12,
              alignSelf: 'flex-end',
              marginTop: -6,
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
          <Btn full onClick={doLogin}>
            Iniciar sesión
          </Btn>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
            ¿No tienes cuenta?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setTab('register')
              }}
              style={{ color: '#1a1a1a', fontWeight: 700 }}
            >
              Regístrate
            </a>
          </p>
        </div>
      )}
      {tab === 'register' && (
        <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {regErr && (
            <div
              className="anim-shake"
              style={{
                background: 'rgba(198,40,40,.1)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                color: '#c62828',
              }}
            >
              {regErr}
            </div>
          )}
          <Field
            label="Nombres"
            value={regNombres}
            onChange={(e) => setRegNombres(e.target.value)}
            placeholder="Ej: Juan Carlos"
          />
          <Field
            label="Apellidos"
            value={regApellidos}
            onChange={(e) => setRegApellidos(e.target.value)}
            placeholder="Ej: Pérez González"
          />
          <Field
            label="Correo electrónico"
            type="email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            placeholder="correo@ejemplo.cl"
          />
          <Field
            label="Teléfono"
            value={regTel}
            onChange={(e) => setRegTel(formatPhone(e.target.value))}
            placeholder="+56 9 1234 5678"
          />
          <Field
            label="Contraseña"
            type="password"
            value={regPass}
            onChange={(e) => setRegPass(e.target.value)}
            placeholder="Mínimo 4 carácteres"
          />
          <Btn full onClick={doRegisterStart} disabled={sending}>
            {sending ? 'Enviando código...' : 'Crear cuenta'}
          </Btn>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
            ¿Ya tienes cuenta?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setTab('login')
              }}
              style={{ color: '#1a1a1a', fontWeight: 700 }}
            >
              Inicia sesión
            </a>
          </p>
        </div>
      )}
    </Modal>
  )
}

function Nav({ currentUser, onShowAuth, onLogout, onGoHome, onGoPerfil, onGoPedidos, onGoAdmin }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <nav
      style={{
        height: 82,
        padding: '0 26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(205,205,205,.5)',
        background: 'rgba(255,255,255,.35)',
        borderRadius: '16px 16px 0 0',
        backdropFilter: 'blur(8px)',
        position: 'relative',
        zIndex: 300,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onGoHome()
          }}
          style={{
            width: 42,
            height: 42,
            background: '#1a1a1a',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            textDecoration: 'none',
          }}
        >
          <img
            src="/LOGO_LANDING.png"
            alt="Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.textContent = '🪵'
            }}
          />
        </a>
        <span style={{ fontSize: 26, fontWeight: 800 }}>Hernández Muebles</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <span style={{ fontSize: 14, color: 'rgba(42,42,42,.4)' }}>•</span>
        {!currentUser ? (
          <Btn outline onClick={onShowAuth}>
            <span style={{ fontSize: 18 }}>👤</span> Iniciar sesión
          </Btn>
        ) : (
          <div ref={ref} style={{ position: 'relative' }}>
            <button
              onClick={() => setOpen((o) => !o)}
              style={{
                background: 'rgba(26,26,26,.15)',
                border: 'none',
                cursor: 'pointer',
                width: 38,
                height: 38,
                borderRadius: '50%',
                fontSize: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              👤
            </button>
            {open && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 46,
                  minWidth: 210,
                  background: 'rgba(255,255,255,.97)',
                  border: '1px solid rgba(221,221,221,.8)',
                  borderRadius: 10,
                  padding: 8,
                  zIndex: 600,
                  boxShadow: '0 8px 24px rgba(0,0,0,.18)',
                }}
              >
                <div
                  style={{
                    padding: '8px 10px 6px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#555',
                    borderBottom: '1px solid #eee',
                    marginBottom: 4,
                  }}
                >
                  {currentUser.nombres} {currentUser.apellidos}
                  {currentUser.is_admin && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 10,
                        background: '#1a1a1a',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      Admin
                    </span>
                  )}
                </div>
                {[
                  { icon: '👤', label: 'Perfil', fn: () => { setOpen(false); onGoPerfil() } },
                  {
                    icon: '📋',
                    label: 'Mis cotizaciones',
                    fn: () => { setOpen(false); onGoPedidos() },
                  },
                  ...(currentUser.is_admin
                    ? [
                        {
                          icon: '⚙️',
                          label: 'Panel administrativo',
                          fn: () => { setOpen(false); onGoAdmin() },
                        },
                      ]
                    : []),
                ].map(({ icon, label, fn }) => (
                  <button
                    key={label}
                    onClick={fn}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      padding: '9px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 14,
                      display: 'flex',
                      gap: 8,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(247,239,232,.9)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    {icon} {label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid #eee', marginTop: 4, paddingTop: 4 }}>
                  <button
                    onClick={() => { setOpen(false); onLogout() }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      padding: '9px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 14,
                      color: '#b00020',
                      display: 'flex',
                      gap: 8,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(247,239,232,.9)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    🚪 Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function PageHome(props) {
  return (
    <Card>
      <Nav {...props} />
      <section className="hero-elegant">
        <div className="hero-overlay" />
        <div className="hero-content anim-pop">
          <p className="anim-fade-up hero-kicker" style={{ animationDelay: '.05s' }}>
            Carpintería artesanal · Hecho a mano
          </p>
          <h1 className="anim-fade-up hero-title-elegant" style={{ animationDelay: '.15s' }}>
            Muebles a medida
            <br />
            para tu hogar
          </h1>
          <p className="anim-fade-up hero-sub" style={{ animationDelay: '.25s' }}>
            Diseño, materiales y terminaciones pensados para tu espacio. Cotiza en minutos y recibe
            un mueble hecho exclusivamente para ti.
          </p>
        </div>
      </section>
      <section style={{ padding: '54px 28px 60px' }}>
        <div className="anim-fade-up" style={{ textAlign: 'center', marginBottom: 38 }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: '#999',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Nuestro proceso
          </p>
          <h2 style={{ fontSize: 'clamp(22px,3.4vw,32px)', color: '#1a1a1a', fontWeight: 800 }}>
            Simple, transparente y a tu medida
          </h2>
        </div>
        <div className="feature-grid">
          {[
            {
              title: 'Cotiza online',
              text: 'Selecciona el tipo de mueble, sus medidas y materiales en un par de minutos.',
            },
            {
              title: 'Materiales premium',
              text: 'Melamina y MDF de alta densidad, con una amplia paleta de colores y texturas.',
            },
            {
              title: 'Seguimiento real',
              text: 'Sigue cada etapa de tu pedido desde la cotización hasta la entrega final.',
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className="feature-card anim-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, color: '#1a1a1a' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="cta-elegant anim-fade-up">
        <h2 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, marginBottom: 10 }}>
          ¿Listo para tu próximo mueble?
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,.7)',
            marginBottom: 22,
            maxWidth: 480,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Cuéntanos qué necesitas y te enviaremos una cotización personalizada sin compromiso.
        </p>
        <button
          className="hero-btn-primary"
          style={{ background: '#fff', color: '#111' }}
          onClick={props.onCotizar}
        >
          Comenzar cotización
        </button>
      </section>
    </Card>
  )
}

function ModalCotizar({ currentUser, onClose, onSubmit, coloresDB = [] }) {
  const initial = {
    tipo: '',
    tipoOtro: '',
    largo: '',
    ancho: '',
    prof: '',
    material: '',
    mdfTipo: MDF_GROSORES[0],
    colorMel: null,
    comentarios: '',
    file: null,
    filePreview: null,
  }
  const [data, setData] = useState(initial)
  const [step, setStep] = useState('form')
  const [err, setErr] = useState('')
  const [lastCot, setLastCot] = useState(null)
  const [resetting, setResetting] = useState(false)

  const set = (k, v) => setData((prev) => ({ ...prev, [k]: v }))

  function handleReset() {
    setResetting(true)
    setData(initial)
    setErr('')
    setTimeout(() => setResetting(false), 500)
  }

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    const ok = ['image/png', 'image/jpeg']
    if (!ok.includes(f.type)) {
      setErr('Solo se aceptan imágenes PNG o JPG.')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setErr('La imagen supera 5 MB.')
      return
    }
    setErr('')
    const reader = new FileReader()
    reader.onload = (ev) => setData((prev) => ({ ...prev, file: f, filePreview: ev.target.result }))
    reader.readAsDataURL(f)
  }

  function removeFile() {
    setData((prev) => ({ ...prev, file: null, filePreview: null }))
  }

  function materialLabel() {
    if (!data.material) return '—'
    if (data.material === 'Melamina')
      return data.colorMel ? `Melamina 15 mm — ${data.colorMel.nombre}` : 'Melamina 15 mm'
    return data.mdfTipo
  }

  function goResumen() {
    if (!data.tipo) {
      setErr('Selecciona un tipo de mueble.')
      return
    }
    if (data.tipo === 'Otro' && !data.tipoOtro.trim()) {
      setErr('Especifica el tipo de mueble.')
      return
    }
    if (!data.filePreview) {
      setErr('Debes adjuntar una imagen de referencia. Es obligatoria.')
      return
    }
    if (!data.largo || !data.ancho || !data.prof) {
      setErr('Completa las medidas (largo, ancho y altura).')
      return
    }
    if (!data.material) {
      setErr('Selecciona un material.')
      return
    }
    if (data.material === 'Melamina' && !data.colorMel) {
      setErr('Selecciona un color de melamina.')
      return
    }
    setErr('')
    setStep('resumen')
  }

  function handleSubmit() {
    const tipoFinal = data.tipo === 'Otro' ? data.tipoOtro.trim() : data.tipo
    const número = currentUser?.telefono || ''
    const nueva = {
      id: Date.now(),
      código: generarCódigo(currentUser?.nombres, currentUser?.apellidos, número),
      estado: 'cotización',
      clienteEmail: (currentUser?.email || '').toLowerCase(),
      nombre: `${currentUser?.nombres || ''} ${currentUser?.apellidos || ''}`.trim(),
      email: (currentUser?.email || '').toLowerCase(),
      número,
      tipo: tipoFinal,
      tipoOtro: data.tipoOtro || '',
      diseñoId: '',
      diseñoTitulo: data.tipo === 'Otro' ? 'Mueble personalizado (ver imagen adjunta)' : '',
      dim: {
        ancho: Number(data.largo) || 0,
        alto: Number(data.ancho) || 0,
        prof: Number(data.prof) || 0,
      },
      material: materialLabel(),
      color: data.colorMel?.nombre || '',
      colorHex: data.colorMel?.hex || '',
      colorTextura: data.colorMel?.texture || null,
      colorGrain: data.colorMel?.grain || null,
      descripción: data.comentarios || '',
      adjunto: data.file ? { nombre: data.file.name, tipo: data.file.type, size: data.file.size } : null,
      adjuntoBase64: data.filePreview || null,
      fecha: new Date().toLocaleString('es-CL'),
      mensajes: [{ autor: 'sistema', texto: 'Solicitud recibida' }],
      chatCerrado: false,
    }
    onSubmit(nueva)
    setLastCot(nueva)
    setStep('done')
  }

  const dimsLabels = [
    ['largo', 'Largo'],
    ['ancho', 'Ancho'],
    ['prof', 'Altura'],
  ]

  if (step === 'done' && lastCot) {
    return (
      <div className="cz-overlay anim-overlay">
        <div className="cz-shell anim-pop" style={{ maxWidth: 560 }}>
          <div className="cz-topbar">
            <div />
            <button className="cz-icon-btn" onClick={onClose} title="Cerrar">
              ✕
            </button>
          </div>
          <div className="cz-body anim-fade-up" style={{ textAlign: 'center', padding: '10px 24px 30px' }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>✅</div>
            <h3 style={{ fontSize: 22, marginBottom: 6, color: '#222222' }}>¡Cotización enviada!</h3>
            <p style={{ color: '#666', marginBottom: 18, fontSize: 14 }}>
              Tu solicitud fue recibida. Te contactaremos pronto.
            </p>
            <div className="cz-summary-card" style={{ textAlign: 'left', marginBottom: 18 }}>
              <div className="cz-summary-row">
                <span>Código</span>
                <b style={{ color: '#1a1a1a' }}>{lastCot.código}</b>
              </div>
              <div className="cz-summary-row">
                <span>Tipo</span>
                <b>{lastCot.tipo}</b>
              </div>
              <div className="cz-summary-row">
                <span>Medidas</span>
                <b>
                  {lastCot.dim.ancho} × {lastCot.dim.alto} × {lastCot.dim.prof} cm
                </b>
              </div>
              <div className="cz-summary-row">
                <span>Material</span>
                <b>{lastCot.material}</b>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="cz-btn cz-btn-primary" onClick={onClose}>
                Volver al inicio
              </button>
              <button
                className="cz-btn cz-btn-ghost"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/pdf/cotizacion', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(lastCot),
                    })
                    if (!res.ok) throw new Error('Error al generar PDF')
                    const blob = await res.blob()
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `COTIZACION_${lastCot.código}.pdf`
                    a.click()
                    URL.revokeObjectURL(url)
                  } catch (e) {
                    alert('No se pudo generar el PDF: ' + e.message)
                  }
                }}
              >
                ⬇ Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cz-overlay anim-overlay">
      <div className="cz-shell anim-pop">
        <div className="cz-topbar">
          <button
            className="cz-icon-btn"
            onClick={() => (step === 'resumen' ? setStep('form') : onClose())}
            title="Volver"
          >
            ←
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`cz-icon-btn${resetting ? ' spinning' : ''}`}
              onClick={handleReset}
              title="Reiniciar formulario"
            >
              ⟲
            </button>
            <button className="cz-icon-btn" onClick={onClose} title="Cerrar">
              ✕
            </button>
          </div>
        </div>
        {err && (
          <div
            className="anim-shake"
            style={{
              margin: '0 24px 12px',
              background: 'rgba(198,40,40,.1)',
              color: '#c62828',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {err}
          </div>
        )}
        <div className="cz-body">
          {step === 'form' && (
            <div className="cz-grid">
              <div className="anim-slide-l cz-tipo-list">
                {TIPOS_MUEBLE.map((t) => (
                  <div
                    key={t}
                    className={`cz-tipo-item${data.tipo === t ? ' selected' : ''}`}
                    onClick={() => {
                      set('tipo', t)
                      if (t !== 'Otro') set('tipoOtro', '')
                    }}
                  >
                    <span className="cz-tipo-title">{t}</span>
                    <span className="cz-radio" />
                  </div>
                ))}
              </div>
              <div className="anim-slide-r cz-panel">
                {!data.tipo ? (
                  <div className="cz-panel-empty">
                    Selecciona un tipo de mueble
                    <br />
                    para continuar con los detalles
                  </div>
                ) : (
                  <>
                    {data.tipo === 'Otro' && (
                      <div className="cz-field" style={{ position: 'relative', zIndex: 1 }}>
                        <label>Tipo de mueble</label>
                        <input
                          value={data.tipoOtro}
                          onChange={(e) => set('tipoOtro', e.target.value)}
                          placeholder="Ej: Estantería flotante, closet, etc."
                        />
                      </div>
                    )}
                    <div className="cz-row3">
                      {dimsLabels.map(([key, label]) => (
                        <div className="cz-field" key={key}>
                          <label>{label} (cm)</label>
                          <input
                            type="number"
                            min="0"
                            value={data[key]}
                            onChange={(e) => set(key, e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="cz-row2">
                      <div className="cz-field">
                        <label>Material</label>
                        <select
                          value={data.material}
                          onChange={(e) => {
                            set('material', e.target.value)
                            if (e.target.value !== 'Melamina') set('colorMel', null)
                          }}
                        >
                          <option value="">Selecciona</option>
                          <option value="Melamina">Melamina (15 mm)</option>
                          <option value="MDF">MDF melamínico</option>
                        </select>
                      </div>
                      <div className="cz-field">
                        <label>Color</label>
                        {data.material === 'MDF' ? (
                          <select value={data.mdfTipo} onChange={(e) => set('mdfTipo', e.target.value)}>
                            {MDF_GROSORES.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div style={{ fontSize: 13, color: 'rgba(243,230,216,.55)', paddingTop: 8 }}>
                            {data.material === 'Melamina'
                              ? data.colorMel
                                ? data.colorMel.nombre
                                : 'Elige abajo ↓'
                              : '—'}
                          </div>
                        )}
                      </div>
                    </div>
                    {data.material === 'Melamina' && (
                      <div className="cz-swatches">
                        {coloresDB && coloresDB.length > 0 ? (
                          coloresDB.map((c) => {
                            const sel = data.colorMel?.nombre === c.nombre
                            const bg = c.hex || '#ccc'
                            return (
                              <div
                                key={c.nombre}
                                className={`cz-swatch${sel ? ' selected' : ''}`}
                                style={{ background: bg }}
                                title={c.nombre}
                                onClick={() => set('colorMel', c)}
                              />
                            )
                          })
                        ) : (
                          <p style={{ color: '#888', fontSize: 12, width: '100%', textAlign: 'center' }}>
                            ⏳ Cargando colores...
                          </p>
                        )}
                      </div>
                    )}
                    <div className="cz-field" style={{ position: 'relative', zIndex: 1 }}>
                      <label>Comentarios</label>
                      <textarea
                        rows={3}
                        value={data.comentarios}
                        onChange={(e) => set('comentarios', e.target.value)}
                        placeholder="Describe cualquier detalle especial..."
                      />
                    </div>
                    <label className={`cz-upload${!data.filePreview ? ' required' : ''}`}>
                      <input type="file" accept=".png,.jpg,.jpeg" onChange={handleFile} />
                      {data.filePreview ? (
                        <img className="cz-upload-thumb" src={data.filePreview} alt="referencia" />
                      ) : (
                        <span style={{ fontSize: 20 }}>📎</span>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>
                          {data.filePreview ? data.file?.name : 'Agregar imagen de referencia'}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(243,230,216,.5)' }}>
                          Obligatoria · PNG o JPG, máx. 5MB
                        </div>
                      </div>
                      {data.filePreview && (
                        <span
                          onClick={(e) => {
                            e.preventDefault()
                            removeFile()
                          }}
                          style={{ color: '#e08a8a', fontWeight: 800, cursor: 'pointer', padding: 4 }}
                        >
                          ✕
                        </span>
                      )}
                    </label>
                  </>
                )}
              </div>
            </div>
          )}
          {step === 'resumen' && (
            <div className="cz-summary-card" style={{ maxWidth: 620, margin: '0 auto' }}>
              <h3 style={{ fontSize: 19, marginBottom: 14, color: '#222222' }}>Resumen de tu cotización</h3>
              {[
                ['Tipo de mueble', data.tipo === 'Otro' ? data.tipoOtro : data.tipo],
                ['Medidas', `${data.largo || '—'} × ${data.ancho || '—'} × ${data.prof || '—'} cm`],
                ['Material', materialLabel()],
                ['Comentarios', data.comentarios || '—'],
              ].map(([k, v]) => (
                <div className="cz-summary-row" key={k}>
                  <span>{k}</span>
                  <b style={{ textAlign: 'right', maxWidth: '60%' }}>{v}</b>
                </div>
              ))}
              {data.filePreview && (
                <div style={{ marginTop: 14 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#1a1a1a',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    Imagen adjunta
                  </p>
                  <img
                    src={data.filePreview}
                    alt="referencia"
                    style={{
                      maxWidth: 220,
                      maxHeight: 150,
                      borderRadius: 10,
                      border: '2px solid #1a1a1a',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  marginTop: 16,
                  padding: '10px 12px',
                  background: 'rgba(26,26,26,.08)',
                  borderRadius: 10,
                  fontSize: 12,
                  color: '#222222',
                  lineHeight: 1.6,
                }}
              >
                Se enviará a nombre de <b>{currentUser?.nombres} {currentUser?.apellidos}</b> (
                {currentUser?.email}).
              </div>
            </div>
          )}
        </div>
        <div className="cz-footer">
          {step === 'form' ? (
            <>
              <span style={{ fontSize: 12, color: '#1a1a1a', fontWeight: 700 }}>Paso 1 de 2</span>
              <button className="cz-btn cz-btn-primary" onClick={goResumen}>
                Siguiente →
              </button>
            </>
          ) : (
            <>
              <button className="cz-btn cz-btn-ghost" onClick={() => setStep('form')}>
                ← Atrás
              </button>
              <button className="cz-btn cz-btn-primary" onClick={handleSubmit}>
                Enviar cotización ✓
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PageCliente({ currentUser, cotizaciones, onBack, onSendMsg, initialPanel, onUpdateProfile, onChangePassword }) {
  const [panel, setPanel] = useState(initialPanel || 'perfil')
  const [selectedId, setSelectedId] = useState(null)
  const [chatMsg, setChatMsg] = useState('')
  const [editNombres, setEditNombres] = useState(currentUser.nombres || '')
  const [editApellidos, setEditApellidos] = useState(currentUser.apellidos || '')
  const [editTel, setEditTel] = useState(currentUser.telefono || '+56 9 ')
  const [profileMsg, setProfileMsg] = useState('')
  const [passActual, setPassActual] = useState('')
  const [passNueva, setPassNueva] = useState('')
  const [passConfirma, setPassConfirma] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [passErr, setPassErr] = useState('')

  async function saveProfile() {
    if (!editNombres.trim() || !editApellidos.trim()) {
      setProfileMsg('❌ Nombres y apellidos no pueden estar vacíos.')
      return
    }
    try {
      const res = await fetch(`/api/clientes/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: editNombres.trim(),
          apellidos: editApellidos.trim(),
          telefono: editTel,
        }),
      })
      const data = await res.json()
      if (data.cliente) {
        onUpdateProfile?.(data.cliente)
        setProfileMsg('✅ Datos actualizados correctamente.')
        setTimeout(() => setProfileMsg(''), 2500)
      } else {
        setProfileMsg('❌ ' + (data.error || 'Error al actualizar'))
      }
    } catch (error) {
      setProfileMsg('❌ Error al conectar con el servidor')
    }
  }

  async function savePassword() {
    setPassMsg('')
    if (passNueva.length < 4) {
      setPassErr('La nueva contraseña debe tener al menos 4 carácteres.')
      return
    }
    if (passNueva !== passConfirma) {
      setPassErr('Las contraseñas no coinciden.')
      return
    }
    setPassErr('')
    try {
      const res = await fetch(`/api/clientes/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: passActual,
          newPassword: passNueva,
        }),
      })
      const data = await res.json()
      if (data.cliente) {
        onChangePassword?.(passNueva)
        setPassActual('')
        setPassNueva('')
        setPassConfirma('')
        setPassMsg('✅ Contraseña actualizada correctamente.')
        setTimeout(() => setPassMsg(''), 2500)
      } else {
        setPassErr(data.error || 'Error al actualizar contraseña')
      }
    } catch (error) {
      setPassErr('Error al conectar con el servidor')
    }
  }

  const misCots = cotizaciones.filter((c) => c.clienteEmail === currentUser.email || c.email === currentUser.email)

  useEffect(() => {
    if (misCots.length && !selectedId) setSelectedId(misCots[0].id)
  }, [misCots.length])

  const cot = misCots.find((c) => c.id === selectedId)

  const SideBtn = ({ id, icon, label }) => (
    <button
      onClick={() => setPanel(id)}
      style={{
        width: '100%',
        textAlign: 'left',
        background: panel === id ? 'rgba(255,255,255,.15)' : 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '10px 12px',
        borderRadius: 8,
        color: panel === id ? '#fff' : '#d4b890',
        fontSize: 13,
        fontWeight: 700,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = panel === id ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.08)')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = panel === id ? 'rgba(255,255,255,.15)' : 'none')
      }
    >
      {icon} {label}
    </button>
  )

  return (
    <Card>
      <nav
        style={{
          height: 64,
          padding: '0 22px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(205,205,205,.5)',
          background: 'rgba(255,255,255,.45)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', fontSize: 28, marginRight: 8 }}
        >
          ←
        </button>
        <span style={{ fontSize: 22, fontWeight: 800 }}>Mi cuenta</span>
      </nav>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14, padding: 18 }}>
        <div
          style={{
            background: 'rgba(15,15,15,.75)',
            color: '#e8e8e8',
            borderRadius: 14,
            padding: 16,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 12,
              paddingBottom: 10,
              borderBottom: '1px solid rgba(255,255,255,.1)',
            }}
          >
            {currentUser.nombres} {currentUser.apellidos}
          </div>
          <SideBtn id="perfil" icon="👤" label="Perfil" />
          <SideBtn id="pedidos" icon="📋" label="Mis pedidos" />
        </div>
        <div>
          {panel === 'perfil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Card className="anim-fade-up" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 800, marginBottom: 16, color: '#222222' }}>Mis datos</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <Field
                    label="Nombres"
                    value={editNombres}
                    onChange={(e) => setEditNombres(e.target.value)}
                  />
                  <Field
                    label="Apellidos"
                    value={editApellidos}
                    onChange={(e) => setEditApellidos(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <Field
                    label="Correo electrónico"
                    value={currentUser.email}
                    onChange={() => {}}
                    disabled
                  />
                  <Field
                    label="Teléfono"
                    value={editTel}
                    onChange={(e) => setEditTel(formatPhone(e.target.value))}
                  />
                </div>
                {profileMsg && (
                  <div
                    className="anim-fade-up"
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 10,
                      color: profileMsg.startsWith('✅') ? '#2e7d32' : '#c62828',
                    }}
                  >
                    {profileMsg}
                  </div>
                )}
                <Btn onClick={saveProfile}>Guardar cambios</Btn>
              </Card>
              <Card className="anim-fade-up" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 800, marginBottom: 16, color: '#222222' }}>Cambiar contraseña</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
                  <Field
                    label="Contraseña actual"
                    type="password"
                    value={passActual}
                    onChange={(e) => setPassActual(e.target.value)}
                    placeholder="••••"
                  />
                  <Field
                    label="Nueva contraseña"
                    type="password"
                    value={passNueva}
                    onChange={(e) => setPassNueva(e.target.value)}
                    placeholder="Mínimo 4 carácteres"
                  />
                  <Field
                    label="Confirmar nueva contraseña"
                    type="password"
                    value={passConfirma}
                    onChange={(e) => setPassConfirma(e.target.value)}
                    placeholder="••••"
                  />
                  {passErr && (
                    <div
                      className="anim-shake"
                      style={{
                        background: 'rgba(198,40,40,.1)',
                        borderRadius: 8,
                        padding: '8px 12px',
                        fontSize: 12,
                        color: '#c62828',
                      }}
                    >
                      {passErr}
                    </div>
                  )}
                  {passMsg && (
                    <div className="anim-fade-up" style={{ fontSize: 13, fontWeight: 700, color: '#2e7d32' }}>
                      {passMsg}
                    </div>
                  )}
                  <Btn onClick={savePassword}>Actualizar contraseña</Btn>
                </div>
              </Card>
            </div>
          )}
          {panel === 'pedidos' && (
            <Card style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 16, color: '#222222' }}>Mis pedidos</h3>
              {misCots.length === 0 ? (
                <p style={{ color: '#666' }}>No tienes pedidos aún.</p>
              ) : (
                <>
                  <select
                    value={selectedId || ''}
                    onChange={(e) => setSelectedId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid rgba(217,217,217,.7)',
                      borderRadius: 10,
                      fontSize: 14,
                      background: 'rgba(255,255,255,.70)',
                      marginBottom: 16,
                      boxSizing: 'border-box',
                    }}
                  >
                    {misCots.map((c, i) => (
                      <option key={c.id} value={c.id}>
                        {i + 1}. {c.tipo} — {ETAPA_LABEL[c.estado]}
                      </option>
                    ))}
                  </select>
                  {cot && (
                    <>
                      <div className="timeline" style={{ marginBottom: 14 }}>
                        {ETAPAS.map((e) => (
                          <span key={e} className={`stage${e === cot.estado ? ' active' : ''}`}>
                            {ETAPA_LABEL[e]}
                          </span>
                        ))}
                      </div>
                      {cot.adjuntoBase64 && (
                        <div style={{ marginBottom: 12 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
                            Imagen de referencia
                          </p>
                          <img
                            src={cot.adjuntoBase64}
                            alt="Referencia"
                            style={{
                              maxWidth: '100%',
                              maxHeight: 200,
                              borderRadius: 8,
                              objectFit: 'contain',
                              border: '1px solid rgba(200,180,160,.3)',
                              background: '#f5f5f5',
                            }}
                          />
                        </div>
                      )}
                      <div
                        style={{
                          minHeight: 100,
                          maxHeight: 300,
                          overflowY: 'auto',
                          background: 'rgba(255,255,255,.5)',
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 10,
                          border: '1px solid rgba(200,180,160,.3)',
                          fontSize: 13,
                          lineHeight: 1.7,
                        }}
                      >
                        {cot.mensajes.length === 0 ? (
                          <p style={{ color: '#666' }}>Sin mensajes.</p>
                        ) : (
                          cot.mensajes.map((m, i) => (
                            <p key={i} style={{ marginBottom: 4 }}>
                              <b>{m.autor}:</b> {m.texto}
                            </p>
                          ))
                        )}
                      </div>
                      {cot.chatCerrado ? (
                        <p
                          style={{
                            fontSize: 12,
                            color: '#b00020',
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,.04)',
                            borderRadius: 8,
                          }}
                        >
                          Chat cerrado por el Administrador.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            value={chatMsg}
                            onChange={(e) => setChatMsg(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && chatMsg.trim()) {
                                onSendMsg(cot.id, chatMsg.trim(), 'cliente')
                                setChatMsg('')
                              }
                            }}
                            placeholder="Escribe un mensaje..."
                            style={{
                              flex: 1,
                              padding: '10px 12px',
                              border: '1px solid rgba(217,217,217,.7)',
                              borderRadius: 10,
                              fontSize: 14,
                              background: 'rgba(255,255,255,.70)',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                          <Btn
                            onClick={() => {
                              if (chatMsg.trim()) {
                                onSendMsg(cot.id, chatMsg.trim(), 'cliente')
                                setChatMsg('')
                              }
                            }}
                          >
                            Enviar
                          </Btn>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </Card>
  )
}

function PageAdmin({
  cotizaciones,
  precios,
  coloresDB = [],
  cargarCotizaciones,
  cargarColoresDB,
  cargarPreciosDB,
  handleGuardarPreciosBD,
  onBack,
  onChangeEstado,
  onSendMsg,
  onToggleChat,
  onDeleteCot,
  onAceptar,
  onUpdatePrecio,
}) {
  const [section, setSection] = useState('cotizaciones')
  const [filter, setFilter] = useState('todos')
  const [chatFilter, setChatFilter] = useState('todos')
  const [selectedId, setSelectedId] = useState(cotizaciones[0]?.id || null)
  const [msgAdmin, setMsgAdmin] = useState('')
  const [emailDraft, setEmailDraft] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null)
  const [confirmSending, setConfirmSending] = useState(false)
  const [confirmStatus, setConfirmStatus] = useState(null)
  const [calcCotId, setCalcCotId] = useState('')
  const [matMel, setMatMel] = useState(0)
  const [matMelTipo, setMatMelTipo] = useState('')
  const [matMdf, setMatMdf] = useState(0)
  const [matMdfTipo, setMatMdfTipo] = useState(MDF_GROSORES[0])
  const [matTapacanto, setMatTapacanto] = useState(0)
  const [matTcTipo, setMatTcTipo] = useState('')
  const [matTornillos, setMatTornillos] = useState(0)
  const [matManillas, setMatManillas] = useState(0)
  const [matManillaP, setMatManillaP] = useState(0)
  const [matRuedas, setMatRuedas] = useState(0)
  const [matRuedasP, setMatRuedasP] = useState(0)
  const [matBisagras, setMatBisagras] = useState(0)
  const [matBisagrasP, setMatBisagrasP] = useState(0)
  const [matMano, setMatMano] = useState(0)
  const [extras, setExtras] = useState([])

  useEffect(() => {
    if (section === 'precios' && cargarColoresDB) {
      cargarColoresDB()
    }
    if ((section === 'cotizaciones' || section === 'gestionar' || section === 'chat') && cargarCotizaciones) {
      cargarCotizaciones()
    }
  }, [section, cargarColoresDB, cargarCotizaciones])

  const filtered = cotizaciones.filter((q) => {
    if (filter === 'cotización') return q.estado === 'cotización'
    if (filter === 'fabricación') return q.estado === 'fabricación'
    if (filter === 'entregados') return q.estado === 'entregado'
    return true
  })

  const chatFiltered = cotizaciones.filter((q) => {
    if (chatFilter === 'fabricación') return q.estado === 'fabricación'
    if (chatFilter === 'entregado') return q.estado === 'entregado'
    return q.estado !== 'cotización'
  })

  const cot = cotizaciones.find((c) => c.id === selectedId)

  const SideBtn = ({ id, icon, label }) => (
    <button
      onClick={() => setSection(id)}
      style={{
        width: '100%',
        textAlign: 'left',
        background: section === id ? 'rgba(255,255,255,.15)' : 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '10px 12px',
        borderRadius: 8,
        color: section === id ? '#fff' : '#d4b890',
        fontSize: 13,
        fontWeight: 700,
        display: 'flex',
        gap: 8,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = section === id ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.08)')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = section === id ? 'rgba(255,255,255,.15)' : 'none')
      }
    >
      {icon} {label}
    </button>
  )

  function doAvanzar() {
    if (!cot) return
    const i = ETAPAS.indexOf(cot.estado)
    if (i < ETAPAS.length - 1) {
      onChangeEstado(cot.id, ETAPAS[i + 1])
      onSendMsg(cot.id, 'Estado: ' + ETAPA_LABEL[ETAPAS[i + 1]], 'admin')
    } else alert('Ya está en el último estado')
  }

  function doRetroceder() {
    if (!cot) return
    const i = ETAPAS.indexOf(cot.estado)
    if (i > 0) {
      onChangeEstado(cot.id, ETAPAS[i - 1])
      onSendMsg(cot.id, 'Estado retrocedido a ' + ETAPA_LABEL[ETAPAS[i - 1]], 'admin')
    } else alert('Ya está en el primer estado')
  }

  function doEntregado() {
    if (!cot || cot.estado !== 'entrega') {
      alert('El pedido debe estar en estado "Entrega"')
      return
    }
    if (!confirm(`¿Marcar como ENTREGADO a ${cot.nombre}?`)) return
    onChangeEstado(cot.id, 'entregado')
    onSendMsg(cot.id, 'Pedido entregado. ¡Gracias por confiar en Hernández Muebles!', 'sistema')
    onToggleChat(cot.id, true)
  }

  function generarCorreo() {
    if (!cot) return
    const partes = (cot.nombre || '').trim().split(/\s+/)
    setEmailDraft(
      `Buenos ${getSaludo()}, señor/señora ${partes[0]}.\n\nLe escribimos respecto a su cotización código ${cot.código}.\n\n──────────────────────\nDATOS DE COTIZACIÓN\n──────────────────────\nCódigo: ${cot.código}\nFecha: ${cot.fecha}\nCliente: ${cot.nombre}\nCorreo: ${cot.email}\nTeléfono: ${cot.número}\n\nTipo: ${cot.tipo}\nMedidas: ${cot.dim.ancho} × ${cot.dim.alto} × ${cot.dim.prof} cm\nMaterial: ${cot.material}\n──────────────────────\n\n¿Desea confirmar el pedido?\nContáctenos con el código: ${cot.código}\n\nAtentamente,\nHernández Muebles\njoserhernandezmuebles@gmail.com`
    )
    setEmailStatus(null)
  }

  async function sendEmail() {
    if (!cot || !emailDraft.trim()) return
    setEmailSending(true)
    setEmailStatus(null)
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_COTIZACION,
        {
          to_name: cot.nombre,
          to_email: cot.email,
          from_name: 'Hernández Muebles',
          reply_to: ADMIN_EMAIL,
          subject: `Cotización ${cot.código} — Hernández Muebles`,
          message: emailDraft,
          codigo: cot.código,
        },
        EMAILJS_PUBLIC_KEY
      )
      setEmailStatus('ok')
    } catch (err) {
      console.error('EmailJS error:', err)
      setEmailStatus('error')
    } finally {
      setEmailSending(false)
    }
  }

  function generarCorreoPresupuesto() {
    const q = cotizaciones.find(c => String(c.id) === calcCotId)
    if (!q) {
      alert('Primero selecciona una cotización')
      return
    }

    const melP = matMelTipo ? (precios.melamina?.[matMelTipo] || 0) : 0
    const mdfP = matMdfTipo?.includes('18') ? precios.mdf18 : precios.mdf9
    const tcP = matTcTipo ? (precios.tapacanto?.[matTcTipo] || 0) : 0
    
    const filas = [
      { label: `Melamina${matMelTipo ? ' — ' + matMelTipo : ''}`, q: matMel, p: melP, show: Number(matMel) > 0 },
      { label: `MDF ${matMdfTipo?.includes('18') ? '18mm' : '9mm'}`, q: matMdf, p: mdfP, show: Number(matMdf) > 0 },
      { label: `Tapacanto${matTcTipo ? ' — ' + matTcTipo : ''}`, q: matTapacanto, p: tcP, show: Number(matTapacanto) > 0 },
      { label: 'Tornillos (cajas)', q: matTornillos, p: precios.tornillos || 0, show: Number(matTornillos) > 0 },
      { label: 'Manillas', q: matManillas, p: matManillaP || precios.manillas || 0, show: Number(matManillas) > 0 },
      { label: 'Ruedas', q: matRuedas, p: matRuedasP || precios.ruedas || 0, show: Number(matRuedas) > 0 },
      { label: 'Bisagras', q: matBisagras, p: matBisagrasP || precios.bisagras || 0, show: Number(matBisagras) > 0 },
      ...extras.filter(e => Number(e.q) > 0).map(e => ({ label: e.desc || 'Ítem extra', q: e.q, p: e.p, show: true })),
    ].filter(f => f.show)
    
    const subtotal = filas.reduce((acc, f) => acc + (Number(f.q) || 0) * (Number(f.p) || 0), 0)
    const mano = Number(matMano) || 0
    const total = subtotal + mano

    let presupuestoTexto = ''
    if (filas.length > 0 || mano > 0) {
      presupuestoTexto = [
        ``,
        `──────────────────────`,
        `PRESUPUESTO DE MATERIALES`,
        `──────────────────────`,
        ...filas.map(f => `• ${f.label}: ${f.q} × $${(Number(f.p)||0).toLocaleString('es-CL')} = $${((Number(f.q)||0)*(Number(f.p)||0)).toLocaleString('es-CL')}`),
        ...(mano > 0 ? [`• Mano de obra: $${mano.toLocaleString('es-CL')}`] : []),
        `──────────────────────`,
        `TOTAL: $${total.toLocaleString('es-CL')}`,
        `──────────────────────`,
      ].join('\n')
    }

    const partes = (q.nombre || '').trim().split(/\s+/)
    const saludo = getSaludo()

    return `Buenos ${saludo}, señor/señora ${partes[0] || 'cliente'}.\n\nLe escribimos respecto a su cotización código ${q.código}.\n\n──────────────────────\nDATOS DE COTIZACIÓN\n──────────────────────\nCódigo: ${q.código}\nFecha: ${q.fecha}\nCliente: ${q.nombre}\nCorreo: ${q.email}\nTeléfono: ${q.número}\n\nTipo: ${q.tipo}\nMedidas: ${q.dim.ancho} × ${q.dim.alto} × ${q.dim.prof} cm\nMaterial: ${q.material}\n${q.descripción ? `Descripción: ${q.descripción}` : ''}\n──────────────────────${presupuestoTexto}\n\n¿Desea confirmar el pedido?\nContáctenos con el código: ${q.código}\n\nAtentamente,\nHernández Muebles\njoserhernandezmuebles@gmail.com`
  }

  async function enviarCorreoPresupuesto() {
  const q = cotizaciones.find(c => String(c.id) === calcCotId)
  if (!q) {
    alert('Primero selecciona una cotización')
    return
  }

  const emailDraft = generarCorreoPresupuesto()
  if (!emailDraft || !emailDraft.trim()) return

  setEmailSending(true)
  setEmailStatus(null)

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_CONFIRMACION,  
      {
        to_name: q.nombre,
        to_email: q.email,
        from_name: 'Hernández Muebles',
        reply_to: ADMIN_EMAIL,
        subject: `Presupuesto ${q.código} — Hernández Muebles`,
        message: emailDraft,
        codigo: q.código,
      },
      EMAILJS_PUBLIC_KEY
    )
    setEmailStatus('ok')
    alert(`✅ Presupuesto enviado a ${q.email}`)
  } catch (err) {
    console.error('EmailJS error:', err)
    setEmailStatus('error')
    alert('❌ Error al enviar el correo. Revisa tus credenciales de EmailJS.')
  } finally {
    setEmailSending(false)
  }
}

  function calcTotal() {
    const melP = matMelTipo ? precios.melamina?.[matMelTipo] || 0 : 0
    const mdfP = matMdfTipo?.includes('18') ? precios.mdf18 : precios.mdf9
    const tcP = matTcTipo ? precios.tapacanto?.[matTcTipo] || 0 : 0
    const items = [
      { q: matMel, p: melP },
      { q: matMdf, p: mdfP },
      { q: matTapacanto, p: tcP },
      { q: matTornillos, p: precios.tornillos || 0 },
      { q: matManillas, p: matManillaP || precios.manillas || 0 },
      { q: matRuedas, p: matRuedasP || precios.ruedas || 0 },
      { q: matBisagras, p: matBisagrasP || precios.bisagras || 0 },
      ...extras.map((e) => ({ q: e.q, p: e.p })),
    ]
    return items.reduce((acc, it) => acc + (Number(it.q) || 0) * (Number(it.p) || 0), 0) + (Number(matMano) || 0)
  }

  return (
    <Card>
      <nav
        style={{
          height: 64,
          padding: '0 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(205,205,205,.5)',
          background: 'rgba(255,255,255,.45)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', fontSize: 28, marginRight: 8 }}
          >
            ←
          </button>
          <span style={{ fontSize: 22, fontWeight: 800 }}>Panel administrativo</span>
        </div>
        <span
          style={{
            fontSize: 12,
            background: '#1a1a1a',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 6,
            fontWeight: 700,
          }}
        >
          ⚙️ Admin
        </span>
      </nav>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14, padding: 18 }}>
        <div
          style={{
            background: 'rgba(15,15,15,.75)',
            color: '#e8e8e8',
            borderRadius: 14,
            padding: 16,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              paddingBottom: 8,
              borderBottom: '1px solid rgba(255,255,255,.1)',
              marginBottom: 12,
            }}
          >
            Panel Admin
          </div>
          <button
            onClick={onBack}
            style={{
              width: '100%',
              marginBottom: 12,
              justifyContent: 'center',
              background: 'rgba(255,255,255,.25)',
              color: '#f0f0f0',
              border: '1.5px solid rgba(255,255,255,.45)',
              padding: '8px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Volver al inicio
          </button>
          <div style={{ height: 1, background: 'rgba(255,255,255,.15)', marginBottom: 12 }} />
          <p
            style={{
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'rgba(240,219,195,.5)',
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            Cotizaciónes
          </p>
          <SideBtn id="cotizaciones" icon="📋" label="Lista de cotizaciones" />
          <SideBtn id="gestionar" icon="🔧" label="Administrar cotización" />
          <SideBtn id="precios" icon="💰" label="Precios de materiales" />
          <SideBtn id="calculadora" icon="🧮" label="Calculadora presupuesto" />
          <SideBtn id="chat" icon="💬" label="Chat con clientes" />
        </div>
        <div>
          {section === 'cotizaciones' && (
            <Card style={{ padding: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <h4 style={{ fontWeight: 700, margin: 0 }}>Lista de cotizaciones</h4>
                <button
                  onClick={() => {
                    if (cargarCotizaciones) cargarCotizaciones()
                  }}
                  style={{
                    background: '#1a1a1a',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  Recargar
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {[
                  ['todos', 'Todos'],
                  ['cotización', 'Cotización'],
                  ['fabricación', 'Fabricación'],
                  ['entregados', 'Entregados'],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setFilter(v)}
                    className={filter === v ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {filtered.length === 0 ? (
                <p className="muted">No hay cotizaciones.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map((q) => {
                    const ec = ETAPA_COLOR[q.estado] || '#555'
                    const lbl = ETAPA_LABEL[q.estado] || q.estado
                    const yaEnt = q.estado === 'entregado'
                    return (
                      <Card
                        key={q.id}
                        style={{
                          padding: 14,
                          background: 'rgba(255,255,255,.65)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              color: '#1a1a1a',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: 1,
                            }}
                          >
                            {q.código}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{q.nombre}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {q.email} · {q.tipo}
                          </div>
                          <span
                            style={{
                              background: ec,
                              color: '#fff',
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 99,
                              fontWeight: 700,
                            }}
                          >
                            {lbl}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {q.estado === 'cotización' && (
                            <button
                              className="btn-primary btn-sm"
                              onClick={() => {
                                if (!confirm(`¿Aceptar cotización de ${q.nombre}?`)) return
                                onAceptar(q.id)
                              }}
                            >
                              Aceptar
                            </button>
                          )}
                          {q.estado === 'fabricación' && (
                            <button
                              className="btn-primary btn-sm"
                              style={{ background: '#7a4f9a' }}
                              onClick={() => {
                                if (!confirm(`¿Marcar como "En entrega" a ${q.nombre}?`)) return
                                onChangeEstado(q.id, 'entrega')
                                onSendMsg(q.id, 'Pedido listo. Pasando a entrega.', 'admin')
                              }}
                            >
                              Avanzar a entrega
                            </button>
                          )}
                          {q.estado === 'entrega' && (
                            <button
                              className="btn-primary btn-sm"
                              style={{ background: '#2e7d32' }}
                              onClick={() => {
                                if (!confirm(`¿Marcar como entregado a ${q.nombre}?`)) return
                                onChangeEstado(q.id, 'entregado')
                                onSendMsg(
                                  q.id,
                                  '¡Pedido entregado! Gracias por confiar en Hernández Muebles.',
                                  'sistema'
                                )
                                onToggleChat(q.id, true)
                              }}
                            >
                              Marcar entregado
                            </button>
                          )}
                          <button
                            className="btn-outline btn-sm"
                            onClick={() => {
                              setSection('gestionar')
                              setSelectedId(q.id)
                            }}
                          >
                            Administrar
                          </button>
                          {!yaEnt && (
                            <button
                              className="btn-outline btn-sm"
                              style={{ color: '#b00020', borderColor: '#b00020' }}
                              onClick={() => onDeleteCot(q.id)}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </Card>
          )}
          {section === 'gestionar' && (
            <Card style={{ padding: 16 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Administrar cotización</h4>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>
                Selecciónar cotización
              </label>
              <select
                value={selectedId || ''}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid rgba(217,217,217,.7)',
                  borderRadius: 10,
                  fontSize: 14,
                  background: 'rgba(255,255,255,.70)',
                  marginBottom: 12,
                  boxSizing: 'border-box',
                }}
              >
                {cotizaciones.map((c, i) => (
                  <option key={c.id} value={c.id}>
                    {i + 1}. [{c.código}] {c.nombre} ({ETAPA_LABEL[c.estado]})
                  </option>
                ))}
              </select>
              {cot ? (
                <>
                  <Card style={{ padding: 14, marginBottom: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 11,
                            letterSpacing: 1,
                            textTransform: 'uppercase',
                            color: '#1a1a1a',
                            fontWeight: 700,
                          }}
                        >
                          Código
                        </span>
                        <br />
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#222222' }}>{cot.código}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#777' }}>{cot.fecha}</div>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px 18px',
                        fontSize: 13,
                        marginBottom: 10,
                      }}
                    >
                      {[
                        ['Nombre', cot.nombre],
                        ['Correo', cot.email],
                        ['Teléfono', cot.número],
                        ['Tipo', cot.tipo],
                        ['Medidas', `${cot.dim.ancho} × ${cot.dim.alto} × ${cot.dim.prof} cm`],
                        ['Material', cot.material],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <span
                            style={{
                              color: '#777',
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {k}
                          </span>
                          <div style={{ fontWeight: 700 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="timeline">
                      {ETAPAS.map((e) => (
                        <span key={e} className={`stage${e === cot.estado ? ' active' : ''}`}>
                          {ETAPA_LABEL[e]}
                        </span>
                      ))}
                    </div>
                    {cot.adjuntoBase64 && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(200,180,160,.3)' }}>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#1a1a1a',
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            marginBottom: 8,
                          }}
                        >
                          Imagen de referencia del cliente
                        </p>
                        <img
                          src={cot.adjuntoBase64}
                          alt="Referencia"
                          style={{
                            maxWidth: '100%',
                            maxHeight: 280,
                            borderRadius: 10,
                            border: '2px solid rgba(26,26,26,.4)',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      </div>
                    )}
                  </Card>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Btn outline small onClick={doRetroceder}>
                      Retroceder
                    </Btn>
                    <Btn outline small onClick={doAvanzar}>
                      Avanzar
                    </Btn>
                    {cot.estado === 'entrega' && (
                      <Btn small onClick={doEntregado} style={{ background: '#333333' }}>
                        Marcar como entregado
                      </Btn>
                    )}
                    <Btn
                      outline
                      small
                      onClick={async () => {
                        const q = cot
                        try {
                          const res = await fetch('/api/pdf/cotizacion', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(q),
                          })
                          if (!res.ok) throw new Error('Error al generar PDF')
                          const blob = await res.blob()
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `COTIZACION_${q.código}.pdf`
                          a.click()
                          URL.revokeObjectURL(url)
                        } catch (e) {
                          alert('No se pudo generar el PDF: ' + e.message)
                        }
                      }}
                    >
                      Descargar PDF
                    </Btn>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <label style={{ fontSize: 13, fontWeight: 700 }}>Borrador de correo al cliente</label>
                      <Btn small onClick={generarCorreo}>
                        Generar correo
                      </Btn>
                    </div>
                    <textarea
                      value={emailDraft}
                      onChange={(e) => {
                        setEmailDraft(e.target.value)
                        setEmailStatus(null)
                      }}
                      rows={10}
                      placeholder="Seleccióna una cotización y presiona 'Generar correo'..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(217,217,217,.7)',
                        borderRadius: 10,
                        fontSize: 13,
                        lineHeight: 1.6,
                        fontFamily: 'monospace',
                        background: 'rgba(255,255,255,.70)',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <Btn
                        onClick={sendEmail}
                        disabled={!emailDraft.trim() || emailSending}
                        style={{ background: '#333333', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        {emailSending ? 'Enviando...' : 'Enviar correo al cliente'}
                      </Btn>
                      {cot && (
                        <span style={{ fontSize: 12, color: '#888' }}>
                          Destinatario: <b style={{ color: '#333' }}>{cot.email}</b>
                        </span>
                      )}
                      {emailStatus === 'ok' && (
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#2e7d32',
                            background: 'rgba(46,125,50,.1)',
                            padding: '6px 12px',
                            borderRadius: 8,
                          }}
                        >
                          Correo enviado
                        </span>
                      )}
                      {emailStatus === 'error' && (
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#c62828',
                            background: 'rgba(198,40,40,.1)',
                            padding: '6px 12px',
                            borderRadius: 8,
                          }}
                        >
                          Error al enviar
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p className="muted">No hay cotizaciones</p>
              )}
            </Card>
          )}
          {section === 'precios' && (
            <Card style={{ padding: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <h4 style={{ fontWeight: 700, margin: 0 }}>Precios de materiales</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      cargarColoresDB(true)
                      cargarPreciosDB()
                    }}
                    style={{
                      background: '#1a1a1a',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Recargar
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
                {coloresDB && coloresDB.length > 0
                  ? `${coloresDB.length} colores cargados desde la base de datos`
                  : 'Cargando colores...'}
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Color</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>Melamina ($)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>Tapacanto ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coloresDB && coloresDB.length > 0 ? (
                      coloresDB.map((color, index) => {
                        const precioMelamina = precios.melamina?.[color.nombre] ?? color.melamina ?? 0
                        const precioTapacanto = precios.tapacanto?.[color.nombre] ?? color.tapacanto ?? 0
                        return (
                          <tr
                            key={color.id || color.nombre}
                            style={{
                              background: index % 2 === 0 ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.3)',
                              borderBottom: '1px solid rgba(200,180,160,.2)',
                            }}
                          >
                            <td style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 4,
                                  background: color.hex || '#ccc',
                                  border: '1px solid rgba(0,0,0,.1)',
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ fontWeight: 600 }}>{color.nombre}</span>
                              <span style={{ fontSize: 10, color: '#888', fontWeight: 400 }}>
                                ({color.categoria || 'unico'})
                              </span>
                            </td>
                            <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                              <input
                                type="number"
                                value={precioMelamina}
                                onChange={(e) =>
                                  onUpdatePrecio('melamina', color.nombre, Number(e.target.value))
                                }
                                style={{
                                  width: '100%',
                                  maxWidth: 120,
                                  padding: '6px 8px',
                                  border: '1px solid rgba(217,217,217,.7)',
                                  borderRadius: 6,
                                  fontSize: 13,
                                  background: 'rgba(255,255,255,.70)',
                                  textAlign: 'center',
                                  boxSizing: 'border-box',
                                }}
                              />
                            </td>
                            <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                              <input
                                type="number"
                                value={precioTapacanto}
                                onChange={(e) =>
                                  onUpdatePrecio('tapacanto', color.nombre, Number(e.target.value))
                                }
                                style={{
                                  width: '100%',
                                  maxWidth: 120,
                                  padding: '6px 8px',
                                  border: '1px solid rgba(217,217,217,.7)',
                                  borderRadius: 6,
                                  fontSize: 13,
                                  background: 'rgba(255,255,255,.70)',
                                  textAlign: 'center',
                                  boxSizing: 'border-box',
                                }}
                              />
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                          Cargando colores...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(200,180,160,.3)' }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#222222', marginBottom: 10 }}>
                  MDF melamínico
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    ['mdf9', 'MDF 9mm (Blanco)'],
                    ['mdf18', 'MDF 18mm (Blanco)'],
                  ].map(([k, l]) => (
                    <div key={k}>
                      <label style={{ fontSize: 11, color: '#666', fontWeight: 700, display: 'block', marginBottom: 2 }}>
                        {l} ($)
                      </label>
                      <input
                        type="number"
                        value={precios[k] || 0}
                        onChange={(e) => onUpdatePrecio(k, null, Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid rgba(217,217,217,.7)',
                          borderRadius: 8,
                          fontSize: 13,
                          background: 'rgba(255,255,255,.70)',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#222222', marginBottom: 10 }}>
                  Quincallería (precio unitario)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    ['tornillos', 'Tornillos — caja'],
                    ['manillas', 'Manillas'],
                    ['ruedas', 'Ruedas'],
                    ['bisagras', 'Bisagras'],
                  ].map(([k, l]) => (
                    <div key={k}>
                      <label style={{ fontSize: 11, color: '#666', fontWeight: 700, display: 'block', marginBottom: 2 }}>
                        {l} ($)
                      </label>
                      <input
                        type="number"
                        value={precios[k] || 0}
                        onChange={(e) => onUpdatePrecio(k, null, Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid rgba(217,217,217,.7)',
                          borderRadius: 8,
                          fontSize: 13,
                          background: 'rgba(255,255,255,.70)',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleGuardarPreciosBD}
                className="btn-primary"
                style={{
                  width: '100%',
                  marginTop: 16,
                  background: '#2d5a3d',
                  padding: '12px 16px',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Guardar todos los precios en la BD
              </button>
            </Card>
          )}
          {section === 'calculadora' && (
            <Card style={{ padding: 16 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Calculadora de presupuesto</h4>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>
                  Cotización de referencia
                </label>
                <select
                  value={calcCotId}
                  onChange={(e) => {
                    const val = e.target.value
                    setCalcCotId(val)
                    const q = cotizaciones.find((c) => String(c.id) === val)
                    if (q?.color) {
                      setMatMelTipo(q.color)
                      setMatTcTipo(q.color)
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid rgba(217,217,217,.7)',
                    borderRadius: 10,
                    fontSize: 14,
                    background: 'rgba(255,255,255,.70)',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">— Selecciónar cotización —</option>
                  {cotizaciones.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      [{c.código}] {c.nombre} — {c.tipo}
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const q = cotizaciones.find((c) => String(c.id) === calcCotId)
                if (!q) {
                  return (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '30px 20px',
                        background: 'rgba(255,255,255,.4)',
                        borderRadius: 12,
                        border: '2px dashed rgba(200,180,160,.3)',
                        color: '#888',
                      }}
                    >
                      <div style={{ fontSize: 40, marginBottom: 10 }}>🪑</div>
                      <p>Selecciona una cotización para ver los detalles</p>
                    </div>
                  )
                }

                const swatchBg = q.colorHex || null

                return (
                  <div
                    style={{
                      background: 'rgba(255,255,255,.65)',
                      border: '1px solid rgba(200,180,160,.35)',
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 12 }}>
                      {q.adjuntoBase64 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div
                            style={{
                              background: '#fff',
                              borderRadius: 10,
                              padding: 6,
                              boxShadow: '0 2px 8px rgba(0,0,0,.08)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onClick={() => {
                              window.open(q.adjuntoBase64, '_blank')
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                          >
                            <img
                              src={q.adjuntoBase64}
                              style={{
                                width: 180,
                                height: 140,
                                objectFit: 'contain',
                                borderRadius: 7,
                                background: '#f5f5f5',
                              }}
                              alt="Referencia"
                            />
                          </div>
                          <span style={{ fontSize: 10, color: '#888' }}>Haz clic para ampliar</span>
                        </div>
                      ) : (
                        <div
                          style={{
                            width: 180,
                            height: 140,
                            background: 'rgba(139,94,60,.08)',
                            borderRadius: 10,
                            border: '2px dashed rgba(139,94,60,.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 4,
                          }}
                        >
                          <span style={{ fontSize: 32 }}>🪑</span>
                          <span style={{ fontSize: 11, color: '#888', textAlign: 'center', padding: '0 10px' }}>
                            {q.tipo}
                          </span>
                          <span style={{ fontSize: 9, color: '#aaa' }}>Sin imagen de referencia</span>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 14px', fontSize: 13 }}>
                          {[
                            ['Cliente', q.nombre],
                            ['Tipo', q.tipo],
                            ['Ancho × Alto × Prof', q.dim.ancho + ' × ' + q.dim.alto + ' × ' + q.dim.prof + ' cm'],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <span style={{ color: '#888', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                                {k}
                              </span>
                              <div style={{ fontWeight: 700, marginTop: 1 }}>{v}</div>
                            </div>
                          ))}
                          <div>
                            <span style={{ color: '#888', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                              Estado
                            </span>
                            <div style={{ marginTop: 2 }}>
                              <span
                                style={{
                                  background: ETAPA_COLOR[q.estado] || '#555',
                                  color: '#fff',
                                  fontSize: 11,
                                  padding: '2px 8px',
                                  borderRadius: 99,
                                  fontWeight: 700,
                                }}
                              >
                                {ETAPA_LABEL[q.estado] || q.estado}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {swatchBg ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: 8,
                          background: 'rgba(255,255,255,.6)',
                          borderRadius: 8,
                          border: '1px solid rgba(200,180,160,.3)',
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 8,
                            background: swatchBg,
                            border: '1.5px solid rgba(0,0,0,.12)',
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: '#888',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              marginBottom: 2,
                            }}
                          >
                            Color / tipo
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{q.color || '—'}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>{q.material || '—'}</div>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: 8,
                          background: 'rgba(255,255,255,.6)',
                          borderRadius: 8,
                          border: '1px solid rgba(200,180,160,.3)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: '#888',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            marginBottom: 2,
                          }}
                        >
                          Material
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{q.material || '—'}</div>
                      </div>
                    )}

                    {q.descripción && (
                      <div style={{ marginTop: 8 }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: '#888',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            marginBottom: 3,
                          }}
                        >
                          Descripción
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: '#333',
                            padding: 8,
                            background: 'rgba(255,255,255,.6)',
                            borderRadius: 8,
                            border: '1px solid rgba(200,180,160,.25)',
                            lineHeight: 1.5,
                          }}
                        >
                          {q.descripción}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              <p style={{ fontSize: 13, fontWeight: 700, color: '#5c3a1e', marginBottom: 10 }}>
                Cantidades de materiales
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 2 }}>
                    Láminas melamina
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 6 }}>
                    <input
                      type="number"
                      min="0"
                      value={matMel}
                      onChange={(e) => setMatMel(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        border: '1px solid rgba(217,217,217,.7)',
                        borderRadius: 8,
                        fontSize: 13,
                        background: 'rgba(255,255,255,.70)',
                      }}
                    />
                    <select
                      value={matMelTipo}
                      onChange={(e) => setMatMelTipo(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        border: '1px solid rgba(217,217,217,.7)',
                        borderRadius: 8,
                        fontSize: 13,
                        background: 'rgba(255,255,255,.70)',
                      }}
                    >
                      <option value="">Sin Especificar</option>
                      {coloresDB && coloresDB.length > 0
                        ? coloresDB.map((c) => (
                            <option key={c.nombre} value={c.nombre}>
                              {c.nombre}
                            </option>
                          ))
                        : null}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 2 }}>
                    Láminas MDF
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 6 }}>
                    <input
                      type="number"
                      min="0"
                      value={matMdf}
                      onChange={(e) => setMatMdf(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        border: '1px solid rgba(217,217,217,.7)',
                        borderRadius: 8,
                        fontSize: 13,
                        background: 'rgba(255,255,255,.70)',
                      }}
                    />
                    <select
                      value={matMdfTipo}
                      onChange={(e) => setMatMdfTipo(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        border: '1px solid rgba(217,217,217,.7)',
                        borderRadius: 8,
                        fontSize: 13,
                        background: 'rgba(255,255,255,.70)',
                      }}
                    >
                      {MDF_GROSORES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 2 }}>
                    Tapacanto (rollos)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 6 }}>
                    <input
                      type="number"
                      min="0"
                      value={matTapacanto}
                      onChange={(e) => setMatTapacanto(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        border: '1px solid rgba(217,217,217,.7)',
                        borderRadius: 8,
                        fontSize: 13,
                        background: 'rgba(255,255,255,.70)',
                      }}
                    />
                    <select
                      value={matTcTipo}
                      onChange={(e) => setMatTcTipo(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        border: '1px solid rgba(217,217,217,.7)',
                        borderRadius: 8,
                        fontSize: 13,
                        background: 'rgba(255,255,255,.70)',
                      }}
                    >
                      <option value="">Sin Especificar</option>
                      {coloresDB && coloresDB.length > 0
                        ? coloresDB.map((c) => (
                            <option key={c.nombre} value={c.nombre}>
                              {c.nombre} — ${(precios.tapacanto?.[c.nombre] || 0).toLocaleString('es-CL')}
                            </option>
                          ))
                        : null}
                    </select>
                  </div>
                </div>
                {[
                  ['Tornillos (cajas)', matTornillos, setMatTornillos, null, null],
                  ['Manillas', matManillas, setMatManillas, matManillaP, setMatManillaP],
                  ['Ruedas', matRuedas, setMatRuedas, matRuedasP, setMatRuedasP],
                  ['Bisagras', matBisagras, setMatBisagras, matBisagrasP, setMatBisagrasP],
                ].map(([label, q, setQ, p, setP]) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 2 }}>
                      {label}
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: p !== null ? '1fr 1fr' : '1fr', gap: 6 }}>
                      <input
                        type="number"
                        min="0"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Cant."
                        style={{
                          padding: '8px 10px',
                          border: '1px solid rgba(217,217,217,.7)',
                          borderRadius: 8,
                          fontSize: 13,
                          background: 'rgba(255,255,255,.70)',
                        }}
                      />
                      {p !== null && (
                        <input
                          type="number"
                          min="0"
                          value={p}
                          onChange={(e) => setP(e.target.value)}
                          placeholder="Precio unit."
                          style={{
                            padding: '8px 10px',
                            border: '1px solid rgba(217,217,217,.7)',
                            borderRadius: 8,
                            fontSize: 13,
                            background: 'rgba(255,255,255,.70)',
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 2 }}>
                    Mano de obra ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={matMano}
                    onChange={(e) => setMatMano(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid rgba(217,217,217,.7)',
                      borderRadius: 8,
                      fontSize: 13,
                      background: 'rgba(255,255,255,.70)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                {extras.map((ex, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,.5)',
                      border: '1px solid rgba(200,180,160,.4)',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#5c3a1e' }}>Extra #{i + 1}</span>
                      <button
                        onClick={() => setExtras(extras.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b00020', fontSize: 16 }}
                      >
                        ✕
                      </button>
                    </div>
                    <input
                      value={ex.desc}
                      onChange={(e) => setExtras(extras.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)))}
                      placeholder="Descripción"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid rgba(217,217,217,.7)',
                        borderRadius: 8,
                        fontSize: 13,
                        background: 'rgba(255,255,255,.70)',
                        marginBottom: 6,
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <input
                        type="number"
                        min="0"
                        value={ex.q}
                        onChange={(e) => setExtras(extras.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))}
                        placeholder="Cantidad"
                        style={{
                          padding: '8px 10px',
                          border: '1px solid rgba(217,217,217,.7)',
                          borderRadius: 8,
                          fontSize: 13,
                          background: 'rgba(255,255,255,.70)',
                        }}
                      />
                      <input
                        type="number"
                        min="0"
                        value={ex.p}
                        onChange={(e) => setExtras(extras.map((x, j) => (j === i ? { ...x, p: e.target.value } : x)))}
                        placeholder="Precio unit."
                        style={{
                          padding: '8px 10px',
                          border: '1px solid rgba(217,217,217,.7)',
                          borderRadius: 8,
                          fontSize: 13,
                          background: 'rgba(255,255,255,.70)',
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setExtras([...extras, { desc: '', q: 0, p: 0 }])}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid #1a1a1a',
                    borderRadius: 8,
                    padding: '8px 14px',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1a1a1a',
                  }}
                >
                  + Agregar ítem extra
                </button>
              </div>

              {(() => {
                const melP = matMelTipo ? precios.melamina?.[matMelTipo] || 0 : 0
                const mdfP = matMdfTipo?.includes('18') ? precios.mdf18 : precios.mdf9
                const tcP = matTcTipo ? precios.tapacanto?.[matTcTipo] || 0 : 0

                const filas = [
                  { label: `Melamina${matMelTipo ? ' — ' + matMelTipo : ''}`, q: matMel, p: melP, show: Number(matMel) > 0 },
                  { label: `MDF ${matMdfTipo?.includes('18') ? '18mm' : '9mm'}`, q: matMdf, p: mdfP, show: Number(matMdf) > 0 },
                  { label: `Tapacanto${matTcTipo ? ' — ' + matTcTipo : ''}`, q: matTapacanto, p: tcP, show: Number(matTapacanto) > 0 },
                  { label: 'Tornillos (cajas)', q: matTornillos, p: precios.tornillos || 0, show: Number(matTornillos) > 0 },
                  { label: 'Manillas', q: matManillas, p: matManillaP || precios.manillas || 0, show: Number(matManillas) > 0 },
                  { label: 'Ruedas', q: matRuedas, p: matRuedasP || precios.ruedas || 0, show: Number(matRuedas) > 0 },
                  { label: 'Bisagras', q: matBisagras, p: matBisagrasP || precios.bisagras || 0, show: Number(matBisagras) > 0 },
                  ...extras.filter(e => Number(e.q) > 0).map(e => ({ label: e.desc || 'Ítem extra', q: e.q, p: e.p, show: true })),
                ].filter(f => f.show)

                const subtotal = filas.reduce((acc, f) => acc + (Number(f.q) || 0) * (Number(f.p) || 0), 0)
                const mano = Number(matMano) || 0
                const total = subtotal + mano

                return (
                  <>
                    {filas.length > 0 || mano > 0 ? (
                      <div style={{ border: '1px solid rgba(200,180,160,.4)', borderRadius: 10, overflow: 'hidden', marginTop: 10 }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 70px 90px 90px',
                            background: 'rgba(139,94,60,.12)',
                            padding: '7px 12px',
                            fontSize: 11,
                            fontWeight: 800,
                            color: '#5c3a1e',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          <span>Ítem</span>
                          <span style={{ textAlign: 'center' }}>Cant.</span>
                          <span style={{ textAlign: 'right' }}>P. Unit.</span>
                          <span style={{ textAlign: 'right' }}>Subtotal</span>
                        </div>

                        {filas.map((f, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 70px 90px 90px',
                              padding: '7px 12px',
                              fontSize: 13,
                              borderTop: '1px solid rgba(200,180,160,.25)',
                              background: i % 2 === 0 ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.3)',
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>{f.label}</span>
                            <span style={{ textAlign: 'center', color: '#555' }}>{f.q}</span>
                            <span style={{ textAlign: 'right', color: '#555' }}>
                              ${(Number(f.p) || 0).toLocaleString('es-CL')}
                            </span>
                            <span style={{ textAlign: 'right', fontWeight: 700 }}>
                              ${((Number(f.q) || 0) * (Number(f.p) || 0)).toLocaleString('es-CL')}
                            </span>
                          </div>
                        ))}

                        {mano > 0 && (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 70px 90px 90px',
                              padding: '7px 12px',
                              fontSize: 13,
                              borderTop: '1px solid rgba(200,180,160,.25)',
                              background: filas.length % 2 === 0 ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.3)',
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>Mano de obra</span>
                            <span style={{ textAlign: 'center', color: '#888' }}>—</span>
                            <span style={{ textAlign: 'right', color: '#888' }}>—</span>
                            <span style={{ textAlign: 'right', fontWeight: 700 }}>
                              ${mano.toLocaleString('es-CL')}
                            </span>
                          </div>
                        )}

                        <div
                          style={{
                            borderTop: '2px solid rgba(139,94,60,.3)',
                            background: 'rgba(139,94,60,.08)',
                            padding: '10px 12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#5c3a1e' }}>TOTAL PRESUPUESTO</span>
                          <span style={{ fontSize: 20, fontWeight: 800, color: '#5c3a1e' }}>
                            ${total.toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(139,94,60,.08)', borderRadius: 10, padding: 14, marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#5c3a1e' }}>
                          <span>TOTAL PRESUPUESTO</span>
                          <span>${total.toLocaleString('es-CL')}</span>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        onClick={async () => {
                          const q = cotizaciones.find((c) => String(c.id) === calcCotId)
                          try {
                            const payload = {
                              cotizacion: q || null,
                              filas,
                              mano,
                              total,
                              fecha: new Date().toLocaleDateString('es-CL'),
                            }
                            const res = await fetch('/api/pdf/presupuesto', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(payload),
                            })
                            if (!res.ok) throw new Error('Error al generar PDF')
                            const blob = await res.blob()
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `PRESUPUESTO_${q ? q.código : 'SIN'}.pdf`
                            a.click()
                            URL.revokeObjectURL(url)
                          } catch (e) {
                            alert('No se pudo generar el PDF: ' + e.message)
                          }
                        }}
                        style={{
                          flex: 1,
                          background: '#1a1a1a',
                          color: '#fff',
                          border: 'none',
                          padding: '12px 16px',
                          borderRadius: 10,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        Generar PDF presupuesto
                      </button>

                      <button
                        onClick={enviarCorreoPresupuesto}
                        disabled={emailSending || !calcCotId}
                        style={{
                          flex: 1,
                          background: emailSending ? '#888' : '#2d5a3d',
                          color: '#fff',
                          border: 'none',
                          padding: '12px 16px',
                          borderRadius: 10,
                          cursor: emailSending || !calcCotId ? 'not-allowed' : 'pointer',
                          fontSize: 14,
                          fontWeight: 700,
                          opacity: emailSending || !calcCotId ? 0.6 : 1,
                        }}
                      >
                        {emailSending ? 'Enviando...' : 'Enviar presupuesto por correo'}
                      </button>
                    </div>

                    {emailStatus === 'ok' && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: '8px 12px',
                          background: 'rgba(46,125,50,.1)',
                          borderRadius: 8,
                          fontSize: 13,
                          color: '#2e7d32',
                          fontWeight: 700,
                          textAlign: 'center',
                        }}
                      >
                        Presupuesto enviado correctamente
                      </div>
                    )}
                    {emailStatus === 'error' && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: '8px 12px',
                          background: 'rgba(198,40,40,.1)',
                          borderRadius: 8,
                          fontSize: 13,
                          color: '#c62828',
                          fontWeight: 700,
                          textAlign: 'center',
                        }}
                      >
                        Error al enviar el correo
                      </div>
                    )}
                  </>
                )
              })()}
            </Card>
          )}
          {section === 'chat' && (
            <Card style={{ padding: 16 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Chat con clientes</h4>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                {[
                  ['todos', 'Todos'],
                  ['fabricación', 'Fabricación'],
                  ['entregado', 'Entregados'],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setChatFilter(v)}
                    className={chatFilter === v ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>
                Selecciónar conversación
              </label>
              <select
                value={selectedId || ''}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid rgba(217,217,217,.7)',
                  borderRadius: 10,
                  fontSize: 14,
                  background: 'rgba(255,255,255,.70)',
                  marginBottom: 10,
                  boxSizing: 'border-box',
                }}
              >
                <option value="">— Selecciónar conversación —</option>
                {chatFiltered.map((q) => (
                  <option key={q.id} value={q.id}>
                    [{q.código}] {q.nombre} ({ETAPA_LABEL[q.estado]})
                  </option>
                ))}
              </select>
              {cot ? (
                <>
                  <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                    Cliente: {cot.nombre} · {cot.email} · Estado: {ETAPA_LABEL[cot.estado]}
                  </p>
                  <div
                    style={{
                      minHeight: 160,
                      maxHeight: 320,
                      overflowY: 'auto',
                      border: '1px solid rgba(221,221,221,.6)',
                      borderRadius: 8,
                      padding: 10,
                      background: 'rgba(255,255,255,.5)',
                      fontSize: 13,
                      lineHeight: 1.7,
                      marginBottom: 8,
                    }}
                  >
                    {cot.mensajes.map((m, i) => (
                      <p key={i} style={{ marginBottom: 4 }}>
                        <b style={{ color: m.autor === 'admin' ? '#1a1a1a' : '#1f1f1f' }}>{m.autor}:</b> {m.texto}
                      </p>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      value={msgAdmin}
                      onChange={(e) => setMsgAdmin(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && msgAdmin.trim() && !cot.chatCerrado) {
                          onSendMsg(cot.id, msgAdmin.trim(), 'admin')
                          setMsgAdmin('')
                        }
                      }}
                      disabled={cot.chatCerrado}
                      placeholder={cot.chatCerrado ? 'Chat cerrado' : 'Escribe tu mensaje...'}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '1px solid rgba(217,217,217,.7)',
                        borderRadius: 10,
                        fontSize: 13,
                        background: 'rgba(255,255,255,.70)',
                        outline: 'none',
                        opacity: cot.chatCerrado ? 0.55 : 1,
                        boxSizing: 'border-box',
                      }}
                    />
                    <Btn
                      disabled={cot.chatCerrado}
                      onClick={() => {
                        if (msgAdmin.trim()) {
                          onSendMsg(cot.id, msgAdmin.trim(), 'admin')
                          setMsgAdmin('')
                        }
                      }}
                    >
                      Enviar
                    </Btn>
                  </div>
                  <Btn outline small onClick={() => onToggleChat(cot.id, !cot.chatCerrado)}>
                    {cot.chatCerrado ? 'Abrir chat' : 'Cerrar conversación'}
                  </Btn>
                  {cot.chatCerrado && (
                    <p className="muted" style={{ marginTop: 8, color: '#b00020' }}>
                      Conversación cerrada.
                    </p>
                  )}
                </>
              ) : (
                <p className="muted">Selecciona una conversación</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </Card>
  )
}

function FooterContacto() {
  return (
    <div
      style={{
        position: 'fixed',
        left: 18,
        right: 18,
        bottom: 14,
        zIndex: 60,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          color: '#333',
          fontSize: 12,
          fontWeight: 600,
          textShadow: '0 1px 3px rgba(255,255,255,.8)',
          userSelect: 'none',
        }}
      >
        © 2025 Hernández Muebles
      </span>
      <a
        href="mailto:joserhernandezmuebles@gmail.com"
        style={{
          pointerEvents: 'all',
          background: 'rgba(255,255,255,.82)',
          border: '1.5px solid rgba(26,26,26,.4)',
          borderRadius: 999,
          padding: '7px 16px',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 700,
          color: '#222222',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backdropFilter: 'blur(6px)',
          boxShadow: '0 2px 8px rgba(0,0,0,.1)',
          textDecoration: 'none',
        }}
      >
        Contacto
      </a>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('home')
  const [clientePanel, setClientePanel] = useState('perfil')
  const [currentUser, setCurrentUser] = useState(null)
  const [cotizaciones, setCotizaciones] = useState([])
  const [coloresDB, setColoresDB] = useState([])
  const [preciosDB, setPreciosDB] = useState({})
  const [precios, setPrecios] = useState({})
  const [cargando, setCargando] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showCotizar, setShowCotizar] = useState(false)

  async function cargarCotizaciones() {
  if (!currentUser) return
  try {
    setCargando(true)
    const url = currentUser.is_admin
      ? '/api/cotizaciones'
      : `/api/cotizaciones?clienteId=${currentUser.id}`
    const res = await fetch(url)
    const data = await res.json()
    
    if (data.cotizaciones) {
      const etapas = ['cotización', 'fabricación', 'entrega', 'entregado']
      const tipos = ['Escritorio', 'Cocina', 'Baño', 'Otro']
      const formateadas = await Promise.all(
        data.cotizaciones.map(async (c) => {
          let mensajes = []
          let clienteData = null
          
          try {
            const mensajesRes = await fetch(`/api/cotizaciones/${c.id}/mensajes`)
            const mensajesData = await mensajesRes.json()
            mensajes = mensajesData.mensajes || []
          } catch (e) {
            console.warn('Error cargando mensajes:', e)
          }

          // Obtener cliente por separado si no viene en la cotización
          try {
            if (c.cliente_id) {
              const clienteRes = await fetch(`/api/clientes/${c.cliente_id}`)
              const clienteJson = await clienteRes.json()
              clienteData = clienteJson.cliente
            }
          } catch (e) {
            console.warn('Error cargando cliente:', e)
          }

          return {
            id: c.id,
            código: c.codigo,
            estado: etapas[c.etapa_id - 1] || 'cotización',
            clienteEmail: c.cliente_id,
            nombre: clienteData?.nombres + ' ' + clienteData?.apellidos || c.clientes?.nombres + ' ' + c.clientes?.apellidos || 'Cliente',
            email: clienteData?.email || c.clientes?.email || '',
            número: clienteData?.telefono || c.clientes?.telefono || '',
            tipo: c.tipo_otro || tipos[c.tipo_id - 1] || '',
            tipoOtro: c.tipo_otro || '',
            diseñoId: '',
            diseñoTitulo: c.diseno_titulo || '',
            dim: { ancho: c.ancho, alto: c.alto, prof: c.prof },
            material: c.material || '--',
            color: c.color || '--',
            colorHex: c.color_hex || '',
            colorTextura: c.color_textura || '',
            colorGrain: c.color_grain || '',
            descripción: c.descripcion || '',
            adjunto: null,
            adjuntoBase64: c.adjunto_url || null,
            fecha: new Date(c.fecha).toLocaleString('es-CL'),
            mensajes: mensajes,
            chatCerrado: c.chat_cerrado || false,
          }
        })
      )
      setCotizaciones(formateadas)
    }
  } catch (error) {
    console.error('❌ Error cargando cotizaciones:', error)
  } finally {
    setCargando(false)
  }
}

  async function subirImagen(base64, codigo) {
    try {
      const res = await fetch(base64)
      const blob = await res.blob()
      const formData = new FormData()
      const extension = blob.type === 'image/png' ? 'png' : 'jpg'
      formData.append('file', blob, `cotizacion_${codigo}.${extension}`)
      const uploadRes = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await uploadRes.json()
      return data.url || ''
    } catch (error) {
      console.error('Error subiendo imagen:', error)
      return ''
    }
  }

  async function crearCotizacion(datos) {
    if (!currentUser) throw new Error('Usuario no autenticado')
    try {
      const tiposMap = { Escritorio: 1, Cocina: 2, Baño: 3, Otro: 4 }
      const tipoId = tiposMap[datos.tipo] || 4
      let adjuntoUrl = ''
      if (datos.adjuntoBase64) {
        adjuntoUrl = await subirImagen(datos.adjuntoBase64, datos.código)
      }
      const payload = {
        cliente_id: currentUser.id,
        tipo_id: tipoId,
        ancho: parseInt(datos.dim.ancho) || 0,
        alto: parseInt(datos.dim.alto) || 0,
        prof: parseInt(datos.dim.prof) || 0,
        material: datos.material || '',
        color: datos.color || '',
        color_hex: datos.colorHex || '',
        color_textura: datos.colorTextura || '',
        color_grain: datos.colorGrain || '',
        descripcion: datos.descripción || '',
        adjunto_url: adjuntoUrl,
        tipo_otro: datos.tipoOtro || '',
        diseno_titulo: datos.diseñoTitulo || '',
      }
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.cotizacion) {
        await cargarCotizaciones()
        return data.cotizacion
      }
      throw new Error(data.error || 'Error al crear cotización')
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }

  async function enviarMensaje(cotizacionId, texto, autor) {
    if (!texto.trim()) return
    try {
      const res = await fetch(`/api/cotizaciones/${cotizacionId}/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autor: autor === 'admin' ? 'admin' : 'cliente',
          texto: texto.trim(),
        }),
      })
      const data = await res.json()
      if (data.mensaje) {
        await cargarCotizaciones()
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error)
    }
  }

  async function actualizarEtapa(cotizacionId, etapa) {
    try {
      const etapasMap = { cotización: 1, fabricación: 2, entrega: 3, entregado: 4 }
      const etapaId = etapasMap[etapa] || 1
      const res = await fetch(`/api/cotizaciones/${cotizacionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapa_id: etapaId }),
      })
      const data = await res.json()
      if (data.cotizacion) {
        await cargarCotizaciones()
      }
    } catch (error) {
      console.error('Error actualizando etapa:', error)
    }
  }

  async function actualizarChat(cotizacionId, cerrado) {
  try {
    const res = await fetch(`/api/cotizaciones/${cotizacionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_cerrado: cerrado }),
    })
    const data = await res.json()
    if (data.cotizacion) {
      await cargarCotizaciones()
    }
  } catch (error) {
    console.error('Error actualizando chat:', error)
  }
}

  async function eliminarCotizacion(cotizacionId) {
    if (!confirm('¿Eliminar esta cotización?')) return
    try {
      const res = await fetch(`/api/cotizaciones/${cotizacionId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        await cargarCotizaciones()
      }
    } catch (error) {
      console.error('Error eliminando cotización:', error)
    }
  }

  async function cargarColoresDB(forzar = false) {
    if (coloresDB.length > 0 && !forzar) {
      return
    }
    try {
      const res = await fetch('/api/colores')
      const data = await res.json()
      if (data.colores && data.colores.length > 0) {
        setColoresDB(data.colores)
        const preciosMelamina = {}
        data.colores.forEach((color) => {
          preciosMelamina[color.nombre] = color.melamina || 0
        })
        setPrecios((prev) => ({
          ...prev,
          melamina: preciosMelamina,
        }))
      }
    } catch (error) {
      console.error('❌ Error cargando colores:', error)
    }
  }

  async function cargarPreciosDB() {
    try {
      const res = await fetch('/api/precios')
      const data = await res.json()
      if (data.precios) {
        const melaminaPrecios = {}
        const tapacantoPrecios = {}
        const otrosPrecios = {}
        Object.keys(data.precios).forEach((clave) => {
          const valor = data.precios[clave]
          if (clave.startsWith('melamina_')) {
            const nombre = clave.replace('melamina_', '')
            melaminaPrecios[nombre] = valor
          } else if (clave.startsWith('tapacanto_')) {
            const nombre = clave.replace('tapacanto_', '')
            tapacantoPrecios[nombre] = valor
          } else {
            otrosPrecios[clave] = valor
          }
        })
        const nuevosPrecios = {
          ...otrosPrecios,
          melamina: melaminaPrecios,
          tapacanto: tapacantoPrecios,
        }
        setPrecios(nuevosPrecios)
        setPreciosDB(data.precios)
      }
    } catch (error) {
      console.error('❌ Error cargando precios:', error)
    }
  }

  const handleGuardarPreciosBD = async () => {
    try {
      if (precios.melamina) {
        for (const [nombre, valor] of Object.entries(precios.melamina)) {
          const clave = `melamina_${nombre}`
          const valorNumerico = Number(valor) || 0
          await fetch('/api/precios', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clave, valor: valorNumerico }),
          })
        }
      }
      if (precios.tapacanto) {
        for (const [nombre, valor] of Object.entries(precios.tapacanto)) {
          const clave = `tapacanto_${nombre}`
          const valorNumerico = Number(valor) || 0
          await fetch('/api/precios', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clave, valor: valorNumerico }),
          })
        }
      }
      const otrosPrecios = ['mdf9', 'mdf18', 'tornillos', 'manillas', 'ruedas', 'bisagras']
      for (const clave of otrosPrecios) {
        if (precios[clave] !== undefined) {
          const valorNumerico = Number(precios[clave]) || 0
          await fetch('/api/precios', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clave, valor: valorNumerico }),
          })
        }
      }
      alert('Precios actualizados en la BD')
      await cargarPreciosDB()
    } catch (err) {
      console.error('❌ Error guardando precios:', err)
      alert('❌ Error: ' + err.message)
    }
  }

  const handleLogin = async (user) => {
    setCurrentUser(user)
    setShowAuth(false)
    localStorage.setItem('currentUser', JSON.stringify(user))
    await cargarCotizaciones()
    await cargarColoresDB()
    await cargarPreciosDB()
  }

  const handleRegister = (nuevoUsuario) => {
    setCurrentUser(nuevoUsuario)
    setShowAuth(false)
    localStorage.setItem('currentUser', JSON.stringify(nuevoUsuario))
    cargarCotizaciones()
    cargarColoresDB()
    cargarPreciosDB()
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setPage('home')
    setCotizaciones([])
    localStorage.removeItem('currentUser')
  }

  const handleSubmitCot = async (nueva) => {
    try {
      await crearCotizacion(nueva)
      setShowCotizar(false)
    } catch (error) {
      alert('Error al crear cotización: ' + error.message)
    }
  }

  const handleChangeEstado = async (id, estado) => {
    await actualizarEtapa(id, estado)
  }

  const handleSendMsg = async (id, texto, autor) => {
    await enviarMensaje(id, texto, autor)
  }

  const handleToggleChat = async (id, cerrar) => {
    await actualizarChat(id, cerrar)
  }

  const handleDeleteCot = async (id) => {
    await eliminarCotizacion(id)
  }

  const handleAceptar = async (id) => {
    await actualizarEtapa(id, 'fabricación')
    await enviarMensaje(id, 'Cotización aceptada. Pasando a fabricación.', 'admin')
  }

  const handleUpdateProfile = (datos) => {
    setCurrentUser(datos)
    localStorage.setItem('currentUser', JSON.stringify(datos))
  }

  const handleChangePassword = (nuevaPass) => {
    setCurrentUser((prev) => ({ ...prev, password: nuevaPass }))
  }

  const handleResetPassword = (email, nuevaPass) => {
    fetch('/api/clientes/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: '' }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.cliente) {
          fetch(`/api/clientes/${data.cliente.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword: nuevaPass }),
          })
        }
      })
      .catch(console.error)
  }

  const handleUpdatePrecio = (tipo, nombre, valor) => {
    if (tipo === 'melamina' && nombre) {
      setPrecios((prev) => ({
        ...prev,
        melamina: {
          ...prev.melamina,
          [nombre]: valor,
        },
      }))
    } else if (tipo === 'tapacanto' && nombre) {
      setPrecios((prev) => ({
        ...prev,
        tapacanto: {
          ...prev.tapacanto,
          [nombre]: valor,
        },
      }))
    } else {
      setPrecios((prev) => ({
        ...prev,
        [tipo]: valor,
      }))
    }
  }

  function handleCotizar() {
    if (!currentUser) {
      setShowAuth(true)
      return
    }
    setShowCotizar(true)
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setTimeout(() => {
          cargarCotizaciones()
          cargarColoresDB()
          cargarPreciosDB()
        }, 100)
      } catch (e) {
        console.error('Error al restaurar sesión:', e)
      }
    }
  }, [])

  const navProps = {
    currentUser,
    onShowAuth: () => setShowAuth(true),
    onLogout: handleLogout,
    onGoHome: () => setPage('home'),
    onGoPerfil: () => {
      setClientePanel('perfil')
      setPage('cliente')
    },
    onGoPedidos: () => {
      setClientePanel('pedidos')
      setPage('cliente')
    },
    onGoAdmin: () => {
      if (currentUser?.is_admin) setPage('admin')
    },
  }

  return (
    <div className="shell">
      {page === 'home' && <PageHome {...navProps} onCotizar={handleCotizar} />}
      {page === 'cliente' && currentUser && (
        <PageCliente
          currentUser={currentUser}
          cotizaciones={cotizaciones}
          onBack={() => setPage('home')}
          onSendMsg={handleSendMsg}
          initialPanel={clientePanel}
          onUpdateProfile={handleUpdateProfile}
          onChangePassword={handleChangePassword}
        />
      )}
      {page === 'admin' && currentUser?.is_admin && (
        <PageAdmin
          cotizaciones={cotizaciones}
          precios={precios}
          coloresDB={coloresDB}
          cargarCotizaciones={cargarCotizaciones}
          cargarColoresDB={cargarColoresDB}
          cargarPreciosDB={cargarPreciosDB}
          handleGuardarPreciosBD={handleGuardarPreciosBD}
          onBack={() => setPage('home')}
          onChangeEstado={handleChangeEstado}
          onSendMsg={handleSendMsg}
          onToggleChat={handleToggleChat}
          onDeleteCot={handleDeleteCot}
          onAceptar={handleAceptar}
          onUpdatePrecio={handleUpdatePrecio}
        />
      )}
      {showCotizar && currentUser && (
        <ModalCotizar
          currentUser={currentUser}
          onClose={() => setShowCotizar(false)}
          onSubmit={handleSubmitCot}
          coloresDB={coloresDB}
        />
      )}
      {showAuth && (
        <ModalAuth
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onResetPassword={handleResetPassword}
        />
      )}
      <FooterContacto />
    </div>
  )
}