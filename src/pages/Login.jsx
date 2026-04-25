import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetOk, setResetOk] = useState(false)
  const { login, resetSenha, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const handleLogin = async e => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(email, senha)
    } catch {
      setErro('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async e => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await resetSenha(email)
      setResetOk(true)
    } catch {
      setErro('Não foi possível enviar o e-mail. Verifique o endereço.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ISOCS</h1>
          <p className="text-blue-300 text-sm mt-1">Sistema de Controle Departamental</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {!resetMode ? (
            <>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">Entrar na plataforma</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">E-mail</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input" placeholder="seu@email.com" required autoFocus
                  />
                </div>
                <div>
                  <label className="label">Senha</label>
                  <input
                    type="password" value={senha} onChange={e => setSenha(e.target.value)}
                    className="input" placeholder="••••••••" required
                  />
                </div>
                {erro && (
                  <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200">
                    {erro}
                  </div>
                )}
                <button type="submit" className="btn-primary w-full py-2.5 mt-2" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
              <button
                onClick={() => { setResetMode(true); setErro('') }}
                className="mt-4 text-xs text-blue-600 hover:text-blue-800 w-full text-center block"
              >
                Esqueci minha senha
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Recuperar senha</h2>
              <p className="text-sm text-slate-500 mb-6">Informe seu e-mail para receber o link de redefinição.</p>
              {resetOk ? (
                <div className="bg-green-50 text-green-700 text-sm px-3 py-3 rounded-lg border border-green-200 mb-4">
                  E-mail enviado! Verifique sua caixa de entrada.
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="label">E-mail</label>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="input" placeholder="seu@email.com" required autoFocus
                    />
                  </div>
                  {erro && (
                    <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200">
                      {erro}
                    </div>
                  )}
                  <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar link'}
                  </button>
                </form>
              )}
              <button
                onClick={() => { setResetMode(false); setResetOk(false); setErro('') }}
                className="mt-4 text-xs text-slate-500 hover:text-slate-700 w-full text-center block"
              >
                ← Voltar ao login
              </button>
            </>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © {new Date().getFullYear()} ISOCS · Construção a Seco
        </p>
      </div>
    </div>
  )
}
