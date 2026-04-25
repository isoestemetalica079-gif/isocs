import { useEffect, useState } from 'react'
import { Plus, Pencil, Users, Download, Upload, Bell, ClipboardList } from 'lucide-react'
import { doc, setDoc, getDocs, collection, updateDoc, addDoc, query, orderBy, limit } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase/config'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { PERFIS, PERFIL_LABELS } from '../data/dominios'
import StatusBadge from '../components/StatusBadge'

const PERFIL_CORES = {
  gestor: 'bg-purple-100 text-purple-800',
  comercial: 'bg-blue-100 text-blue-800',
  tecnico: 'bg-teal-100 text-teal-800',
  controladoria: 'bg-orange-100 text-orange-800',
}

export default function Admin() {
  const [abaAtiva, setAbaAtiva] = useState('usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', cargo: '', perfil: 'comercial', ativo: true })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [notificacoes, setNotificacoes] = useState([])
  const [logs, setLogs] = useState([])

  const carregarUsuarios = async () => {
    const snap = await getDocs(collection(db, 'usuarios'))
    setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { carregarUsuarios(); carregarNotificacoes(); carregarLogs() }, [])

  const carregarNotificacoes = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'notificacoes'), orderBy('criadoEm', 'desc'), limit(50)))
      setNotificacoes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Erro ao carregar notificações:', err)
    }
  }

  const carregarLogs = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100)))
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Erro ao carregar logs:', err)
    }
  }

  const handleBackup = async () => {
    try {
      const [orcSnap, projSnap] = await Promise.all([
        getDocs(collection(db, 'orcamentos')),
        getDocs(collection(db, 'projetos'))
      ])
      const backup = {
        orcamentos: orcSnap.docs.map(d => d.data()),
        projetos: projSnap.docs.map(d => d.data()),
        timestamp: new Date().toISOString()
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      await addDoc(collection(db, 'logs'), { tipo: 'BACKUP', usuario: 'admin', timestamp: new Date(), descricao: 'Backup realizado com sucesso' })
      carregarLogs()
    } catch (err) {
      console.error('Erro ao fazer backup:', err)
      await addDoc(collection(db, 'logs'), { tipo: 'ERRO', usuario: 'admin', timestamp: new Date(), descricao: `Erro no backup: ${err.message}` })
    }
  }

  const abrirNovo = () => {
    setEditando(null)
    setForm({ nome: '', email: '', senha: '', cargo: '', perfil: 'comercial', ativo: true })
    setErro('')
    setModalOpen(true)
  }

  const abrirEditar = (u) => {
    setEditando(u)
    setForm({ nome: u.nome, email: u.email, senha: '', cargo: u.cargo || '', perfil: u.perfil, ativo: u.ativo !== false })
    setErro('')
    setModalOpen(true)
  }

  const handleSalvar = async e => {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      if (editando) {
        await updateDoc(doc(db, 'usuarios', editando.id), {
          nome: form.nome, cargo: form.cargo, perfil: form.perfil, ativo: form.ativo
        })
      } else {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.senha)
        await setDoc(doc(db, 'usuarios', cred.user.uid), {
          nome: form.nome, email: form.email, cargo: form.cargo, perfil: form.perfil, ativo: true,
          criadoEm: new Date().toISOString()
        })
      }
      await addDoc(collection(db, 'logs'), {
        tipo: 'USUARIO',
        usuario: 'admin',
        timestamp: new Date(),
        descricao: `${editando ? 'Editou' : 'Criou'} usuário ${form.nome} (${form.email})`
      })
      await carregarUsuarios()
      setModalOpen(false)
      carregarLogs()
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
        'auth/weak-password': 'A senha deve ter ao menos 6 caracteres.',
        'auth/invalid-email': 'E-mail inválido.',
      }
      setErro(msgs[err.code] || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="p-6">
      <PageHeader
        title="Administração"
        subtitle="Gerenciamento de usuários, backup e logs"
        actions={abaAtiva === 'usuarios' && (
          <button className="btn-primary flex items-center gap-2" onClick={abrirNovo}>
            <Plus size={16} /> Novo Usuário
          </button>
        )}
      />

      {/* Abas */}
      <div className="flex gap-2 border-b mb-6" style={{ borderColor: 'var(--border)' }}>
        {[
          { id: 'usuarios', label: '👥 Usuários', icon: Users },
          { id: 'backup', label: '💾 Backup', icon: Download },
          { id: 'notificacoes', label: '🔔 Notificações', icon: Bell },
          { id: 'logs', label: '📋 Logs', icon: ClipboardList }
        ].map(aba => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`px-4 py-2 font-semibold transition-colors ${abaAtiva === aba.id ? 'border-b-2' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            style={{
              borderColor: abaAtiva === aba.id ? 'var(--accent)' : 'transparent',
              color: abaAtiva === aba.id ? 'var(--accent)' : 'inherit'
            }}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {/* ABA: USUÁRIOS */}
      {abaAtiva === 'usuarios' && (
        loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : usuarios.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum usuário cadastrado" action={
            <button className="btn-primary" onClick={abrirNovo}><Plus size={15} className="inline mr-1" />Novo Usuário</button>
          } />
        ) : (
          <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Nome', 'E-mail', 'Cargo', 'Perfil', 'Situação', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.nome || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.cargo || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${PERFIL_CORES[u.perfil] || 'bg-slate-100 text-slate-600'}`}>
                      {PERFIL_LABELS[u.perfil] || u.perfil}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.ativo !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.ativo !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => abrirEditar(u)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )
      )}

      {/* ABA: BACKUP */}
      {abaAtiva === 'backup' && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-bold text-lg mb-2">Backup de Dados</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Faça download de todos os dados de Orçamentos e Projetos</p>
            </div>
            <button onClick={handleBackup} className="btn-primary flex items-center gap-2 ml-auto">
              <Download size={16} /> Fazer Backup
            </button>
          </div>
        </div>
      )}

      {/* ABA: NOTIFICAÇÕES */}
      {abaAtiva === 'notificacoes' && (
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Notificações do Sistema</h3>
          {notificacoes.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhuma notificação registrada</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notificacoes.map(n => (
                <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold">{n.titulo}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{n.mensagem}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(n.criadoEm).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA: LOGS */}
      {abaAtiva === 'logs' && (
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Logs de Ações e Erros</h3>
          {logs.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum log registrado</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className={`p-3 rounded-lg border ${log.tipo === 'ERRO' ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`text-xs font-bold ${log.tipo === 'ERRO' ? 'text-red-600 dark:text-red-300' : 'text-slate-600 dark:text-slate-300'}`}>{log.tipo}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{log.descricao}</p>
                      <p className="text-xs text-slate-500 mt-1">Por: {log.usuario} • {new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar Usuário' : 'Novo Usuário'} size="sm">
        <form onSubmit={handleSalvar} className="space-y-4">
          <div>
            <label className="label">Nome completo</label>
            <input className="input" required value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do usuário" />
          </div>
          <div>
            <label className="label">Cargo</label>
            <input className="input" value={form.cargo} onChange={e => set('cargo', e.target.value)} placeholder="Ex: Coordenador LSF, Técnico Sênior, Comercial Regional" />
          </div>
          {!editando && (
            <>
              <div>
                <label className="label">E-mail</label>
                <input className="input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@empresa.com" />
              </div>
              <div>
                <label className="label">Senha inicial</label>
                <input className="input" type="password" required minLength={6} value={form.senha} onChange={e => set('senha', e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
            </>
          )}
          <div>
            <label className="label">Perfil de acesso</label>
            <select className="select" value={form.perfil} onChange={e => set('perfil', e.target.value)}>
              {PERFIS.map(p => <option key={p} value={p}>{PERFIL_LABELS[p]}</option>)}
            </select>
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-semibold text-purple-900 mb-1">👤 Gestor</p>
                <p className="text-purple-700">Acesso total: admin, configurações, usuários, todos os módulos</p>
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="font-semibold text-teal-900 mb-1">🔧 Técnico</p>
                <p className="text-teal-700">Acesso completo aos módulos operacionais (Orçamentos, Projetos, ART, Relatórios). SEM acesso a admin/configurações</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-900 mb-1">💼 Comercial</p>
                <p className="text-blue-700">Acesso apenas para VER Orçamentos. NÃO pode editar, deletar ou acessar outros módulos</p>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="font-semibold text-orange-900 mb-1">📊 Controladoria</p>
                <p className="text-orange-700">Acesso apenas para VER Orçamentos, Projetos e Relatórios. NÃO pode editar ou deletar</p>
              </div>
            </div>
          </div>
          {editando && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => set('ativo', e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <label htmlFor="ativo" className="text-sm text-slate-700">Usuário ativo</label>
            </div>
          )}
          {erro && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200">{erro}</div>}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>
              {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
