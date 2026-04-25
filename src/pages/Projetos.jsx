import { useEffect, useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, FolderKanban } from 'lucide-react'
import { subscribe, addDoc_, updateDoc_, deleteDoc_, COLS } from '../firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import ProjetoForm from '../components/forms/ProjetoForm'
import { format } from 'date-fns'

export default function Projetos() {
  const { perfil } = useAuth()
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [deletando, setDeletando] = useState(null)

  useEffect(() => {
    const unsub = subscribe(COLS.projetos, lista => {
      setDados(lista.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0)))
      setLoading(false)
    })
    return unsub
  }, [])

  const filtrado = useMemo(() => dados.filter(p => {
    const texto = busca.toLowerCase()
    return (!busca || p.cliente?.toLowerCase().includes(texto) || p.projeto?.toLowerCase().includes(texto) || String(p.fluig || '').includes(texto) || String(p.mf || '').includes(texto))
      && (!filtroStatus || p.status === filtroStatus)
  }), [dados, busca, filtroStatus])

  const statusList = [...new Set(dados.map(p => p.status).filter(Boolean))]
  const podeEditar = ['gestor', 'tecnico'].includes(perfil?.perfil)

  const fmtData = ts => {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return format(d, 'dd/MM/yy')
  }

  const handleSalvar = async form => {
    if (editando) await updateDoc_(COLS.projetos, editando.id, form)
    else await addDoc_(COLS.projetos, form)
    setModalOpen(false); setEditando(null)
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Projetos"
        subtitle={`${filtrado.length} projeto${filtrado.length !== 1 ? 's' : ''}`}
        actions={podeEditar && (
          <button className="btn-primary flex items-center gap-2" onClick={() => { setEditando(null); setModalOpen(true) }}>
            <Plus size={16} /> Novo Projeto
          </button>
        )}
      />

      {/* Filtros */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-8" placeholder="Buscar por cliente, projeto, FLUIG..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
          <select className="select w-auto min-w-[180px]" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {statusList.map(s => <option key={s}>{s}</option>)}
          </select>
          {(busca || filtroStatus) && (
            <button className="btn-ghost text-sm" onClick={() => { setBusca(''); setFiltroStatus('') }}>Limpar filtros</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtrado.length === 0 ? (
        <EmptyState icon={FolderKanban} title="Nenhum projeto encontrado" description="Cadastre o primeiro projeto ou ajuste os filtros."
          action={podeEditar && <button className="btn-primary" onClick={() => { setEditando(null); setModalOpen(true) }}><Plus size={15} className="inline mr-1" />Novo Projeto</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Status','MF','FLUIG','Mês','Cliente','Projeto','Proposta Aprovada','Entrada Aprov. Cliente','Saída Aprov. Cliente','Saída Implantação','Nº MF Implantada','Importação','R$ Total',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrado.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.mf || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.fluig || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.mes || '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[160px] truncate">{p.cliente || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{p.projeto || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtData(p.entradaPropostaCliente)}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtData(p.entradaAprovCliente)}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtData(p.saidaAprovCliente)}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtData(p.saidaImplantacao)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.nrMfImplantada || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.importacao || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {p.valorTotal ? Number(p.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {podeEditar && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditando(p); setModalOpen(true) }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                          {perfil?.perfil === 'gestor' && (
                            <button onClick={() => setDeletando(p)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditando(null) }} title={editando ? 'Editar Projeto' : 'Novo Projeto'} size="xl">
        <ProjetoForm inicial={editando} onSalvar={handleSalvar} onCancelar={() => { setModalOpen(false); setEditando(null) }} />
      </Modal>

      <ConfirmDialog open={!!deletando} onClose={() => setDeletando(null)} onConfirm={async () => { await deleteDoc_(COLS.projetos, deletando.id); setDeletando(null) }}
        title="Excluir Projeto" message={`Excluir o projeto "${deletando?.projeto}"? Esta ação não pode ser desfeita.`} danger />
    </div>
  )
}
