import { useState } from 'react'
import { updateProfile, updatePassword, sendPasswordResetEmail } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import PageHeader from '../components/PageHeader'
import { Camera, Lock, Mail } from 'lucide-react'

export default function Perfil() {
  const { user, perfil, logout } = useAuth()
  const [nome, setNome] = useState(perfil?.nome || '')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [fotoFile, setFotoFile] = useState(null)

  const handleAtualizarNome = async e => {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    setSucesso('')
    try {
      await updateProfile(auth.currentUser, { displayName: nome })
      await updateDoc(doc(db, 'usuarios', user.uid), { nome })
      setSucesso('Nome atualizado com sucesso!')
      setTimeout(() => setSucesso(''), 3000)
    } catch (err) {
      setErro('Erro ao atualizar nome: ' + err.message)
    } finally {
      setSalvando(false)
    }
  }

  const handleAtualizarSenha = async e => {
    e.preventDefault()
    if (novaSenha !== confirmaSenha) {
      setErro('As senhas não coincidem')
      return
    }
    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres')
      return
    }
    setSalvando(true)
    setErro('')
    setSucesso('')
    try {
      await updatePassword(auth.currentUser, novaSenha)
      setSucesso('Senha atualizada com sucesso!')
      setNovaSenha('')
      setConfirmaSenha('')
      setSenhaAtual('')
      setTimeout(() => setSucesso(''), 3000)
    } catch (err) {
      const msgs = {
        'auth/weak-password': 'A senha deve ter no mínimo 6 caracteres.',
        'auth/requires-recent-login': 'Você precisa fazer login novamente para alterar a senha.'
      }
      setErro(msgs[err.code] || 'Erro ao atualizar senha: ' + err.message)
    } finally {
      setSalvando(false)
    }
  }

  const handleResetSenha = async () => {
    setSalvando(true)
    setErro('')
    setSucesso('')
    try {
      await sendPasswordResetEmail(auth, user.email)
      setSucesso(`Email de redefinição de senha enviado para ${user.email}`)
      setTimeout(() => setSucesso(''), 5000)
    } catch (err) {
      setErro('Erro ao enviar email: ' + err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Meu Perfil"
        subtitle="Gerencie suas informações pessoais e segurança"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Foto de Perfil */}
        <div className="card p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4" style={{ backgroundColor: 'var(--accent)' }}>
              {(perfil?.nome || user?.email || 'U').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
            </div>
            <h3 className="font-bold text-lg">{nome || 'Usuário'}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold">
              {perfil?.perfil?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Informações Pessoais */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Informações Pessoais</h3>
          <form onSubmit={handleAtualizarNome} className="space-y-4">
            <div>
              <label className="label">Nome completo</label>
              <input
                className="input"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Atualizar Nome'}
            </button>
          </form>
        </div>

        {/* Segurança */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Segurança</h3>
          <div className="space-y-3">
            <button
              onClick={handleResetSenha}
              className="btn-secondary w-full flex items-center gap-2 justify-center"
              disabled={salvando}
            >
              <Mail size={16} />
              {salvando ? 'Enviando...' : 'Redefinir Senha por Email'}
            </button>
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
              Receberá um email com instruções para redefinir sua senha
            </p>
          </div>
        </div>
      </div>

      {/* Alterar Senha */}
      <div className="card p-6 mt-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Lock size={20} /> Alterar Senha
        </h3>
        <form onSubmit={handleAtualizarSenha} className="max-w-md space-y-4">
          <div>
            <label className="label">Nova senha</label>
            <input
              className="input"
              type="password"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>
          <div>
            <label className="label">Confirmar nova senha</label>
            <input
              className="input"
              type="password"
              value={confirmaSenha}
              onChange={e => setConfirmaSenha(e.target.value)}
              placeholder="Confirme a senha"
            />
          </div>
          {erro && <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-700">{erro}</div>}
          {sucesso && <div className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 text-sm px-3 py-2 rounded-lg border border-green-200 dark:border-green-700">{sucesso}</div>}
          <button type="submit" className="btn-primary" disabled={salvando || !novaSenha || !confirmaSenha}>
            {salvando ? 'Atualizando...' : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
