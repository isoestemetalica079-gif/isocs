import { useEffect, useState, useMemo, useCallback } from 'react'
import { Plus, Search, Filter, Pencil, Trash2, FileText } from 'lucide-react'
import { subscribe, addDoc_, updateDoc_, deleteDoc_, COLS } from '../firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import OrcamentoForm from '../components/forms/OrcamentoForm'
import { format } from 'date-fns'

export default function Orcamentos() {
  const { perfil } = useAuth()
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroMes, setFiltroMes] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [deletando, setDeletando] = useState(null)

  useEffect(() => {
    // NÃO sincroniza enquanto modal está aberto (evita re-renders agressivos)
    if (modalOpen) return

    const unsub = subscribe(COLS.orcamentos, lista => {
      setDados(lista.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0)))
      setLoading(false)
    }, [], (err) => {
      console.error('Erro ao carregar orçamentos:', err)
      setLoading(false)
    })
    return unsub
  }, [modalOpen])

  const filtrado = useMemo(() => {
    return dados.filter(o => {
      const texto = busca.toLowerCase()
      const matchBusca = !busca ||
        o.cliente?.toLowerCase().includes(texto) ||
        o.projeto?.toLowerCase().includes(texto) ||
        o.comercial?.toLowerCase().includes(texto) ||
        String(o.fluig || '').includes(texto) ||
        String(o.mf || '').includes(texto)
      const matchStatus = !filtroStatus || o.status === filtroStatus
      const matchMes = !filtroMes || o.mes === filtroMes
      return matchBusca && matchStatus && matchMes
    })
  }, [dados, busca, filtroStatus, filtroMes])

  const statusList = [...new Set(dados.map(o => o.status).filter(Boolean))]
  const mesesList = [...new Set(dados.map(o => o.mes).filter(Boolean))]

  const handleSalvar = useCallback(async (form) => {
    if (editando) {
      await updateDoc_(COLS.orcamentos, editando.id, form)
    } else {
      await addDoc_(COLS.orcamentos, form)
    }
    setModalOpen(false)
    setEditando(null)
  }, [editando])

  const handleEditar = useCallback((item) => {
    setEditando(item)
    setModalOpen(true)
  }, [])

  const handleDeletar = useCallback(async () => {
    await deleteDoc_(COLS.orcamentos, deletando.id)
    setDeletando(null)
  }, [deletando])

  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setEditando(null)
  }, [])

  const handleCancelar = useCallback(() => {
    setModalOpen(false)
    setEditando(null)
  }, [])

  const handleCloseDelete = useCallback(() => {
    setDeletando(null)
  }, [])

  // RBAC: Apenas Gestor e Técnico podem editar
  const podeEditar = ['gestor', 'tecnico'].includes(perfil?.perfil)
  const podeDeletar = perfil?.perfil === 'gestor'

  const fmtData = (ts) => {
    if (!ts) return '—'
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts)
      if (isNaN(d.getTime())) return '—'
      return format(d, 'dd/MM/yyyy')
    } catch {
      return '—'
    }
  }

  const fmtMoeda = (v) => v
    ? Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—'

  return (
    <div className="p-6">
      <PageHeader
        title="Orçamentos"
        subtitle={`${filtrado.length} registro${filtrado.length !== 1 ? 's' : ''} encontrado${filtrado.length !== 1 ? 's' : ''}`}
        actions={podeEditar && (
          <button className="btn-primary flex items-center gap-2" onClick={() => { setEditando(null); setModalOpen(true) }} title="Criar novo orçamento">
            <Plus size={16} /> Novo Orçamento
          </button>
        )}
      />

      {/* Filtros */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-8" placeholder="Buscar por cliente, projeto, comercial, FLUIG..."
              value={busca} onChange={e => setBusca(e.target.value)}
            />
          </div>
          <select className="select w-auto min-w-[160px]" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {statusList.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="select w-auto min-w-[140px]" value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
            <option value="">Todos os meses</option>
            {mesesList.map(m => <option key={m}>{m}</option>)}
          </select>
          {(busca || filtroStatus || filtroMes) && (
            <button className="btn-ghost text-sm" onClick={() => { setBusca(''); setFiltroStatus(''); setFiltroMes('') }}>
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtrado.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum orçamento encontrado"
          description="Cadastre o primeiro orçamento ou ajuste os filtros."
          action={podeEditar && (
            <button className="btn-primary" onClick={() => { setEditando(null); setModalOpen(true) }}>
              <Plus size={15} className="inline mr-1" /> Novo Orçamento
            </button>
          )}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">MF</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">FLUIG</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Mês</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Projeto</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Tipologia</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Área (m²)</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Valor Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Responsável</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Entrada</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrado.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{o.mf || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{o.fluig || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{o.mes || '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[180px] truncate">{o.cliente || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{o.projeto || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{o.tipologia || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{o.area ? Number(o.area).toLocaleString('pt-BR') : '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">{fmtMoeda(o.valorTotal)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{o.responsavel || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtData(o.entradaFluig)}</td>
                    <td className="px-4 py-3">
                      {(podeEditar || perfil?.perfil === 'comercial' || perfil?.perfil === 'controladoria') && (
                        <div className="flex items-center gap-1 justify-end">
                          {podeEditar && (
                            <button onClick={() => handleEditar(o)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar orçamento">
                              <Pencil size={14} />
                            </button>
                          )}
                          {podeDeletar && (
                            <button onClick={() => setDeletando(o)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir orçamento">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Totalizador */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center gap-6 text-sm">
            <span className="text-slate-500">{filtrado.length} registros</span>
            <span className="text-slate-500">
              Total: <strong className="text-slate-900">
                {filtrado.reduce((acc, o) => acc + (Number(o.valorTotal) || 0), 0)
                  .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </span>
            <span className="text-slate-500">
              Fechados: <strong className="text-green-700">
                {filtrado.filter(o => o.fechado === 'SIM').reduce((acc, o) => acc + (Number(o.rFechado) || 0), 0)
                  .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Modal Formulário */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        title={editando ? 'Editar Orçamento' : 'Novo Orçamento'}
        size="xl"
      >
        <OrcamentoForm
          inicial={editando}
          onSalvar={handleSalvar}
          onCancelar={handleCancelar}
        />
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deletando}
        onClose={handleCloseDelete}
        onConfirm={handleDeletar}
        title="Excluir Orçamento"
        message={`Tem certeza que deseja excluir o orçamento "${deletando?.projeto || deletando?.cliente}"? Esta ação não pode ser desfeita.`}
        danger
      />
    </div>
  )
}
