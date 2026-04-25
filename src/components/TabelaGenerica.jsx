import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import EmptyState from './EmptyState'
import PageHeader from './PageHeader'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import { format } from 'date-fns'

const fmtData = ts => {
  if (!ts) return '—'
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return format(d, 'dd/MM/yy')
  } catch { return '—' }
}

const fmtMoeda = v => v ? Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'

export default function TabelaGenerica({
  titulo, subtitulo, icone: Icone,
  dados, loading, colunas,
  podeEditar, podeExcluir,
  FormComponent, formTitulo,
  onSalvar, onDeletar,
  filtros,
}) {
  const [busca, setBusca] = useState('')
  const [filtroExtra, setFiltroExtra] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [deletando, setDeletando] = useState(null)

  const filtrado = useMemo(() => dados.filter(row => {
    const texto = busca.toLowerCase()
    const matchBusca = !busca || Object.values(row).some(v => String(v || '').toLowerCase().includes(texto))
    const matchExtra = Object.entries(filtroExtra).every(([k, v]) => !v || row[k] === v)
    return matchBusca && matchExtra
  }), [dados, busca, filtroExtra])

  const renderCell = (row, col) => {
    const val = row[col.key]
    if (col.tipo === 'status') return <StatusBadge status={val} />
    if (col.tipo === 'data') return <span className="text-slate-500">{fmtData(val)}</span>
    if (col.tipo === 'moeda') return <span className="font-semibold text-slate-900">{fmtMoeda(val)}</span>
    if (col.tipo === 'numero') return <span>{val ? Number(val).toLocaleString('pt-BR') : '—'}</span>
    return <span className={col.truncar ? 'max-w-[160px] truncate block' : 'whitespace-nowrap'}>{val || '—'}</span>
  }

  return (
    <div className="p-6">
      <PageHeader
        title={titulo}
        subtitle={`${filtrado.length} registro${filtrado.length !== 1 ? 's' : ''}`}
        actions={podeEditar && (
          <button className="btn-primary flex items-center gap-2" onClick={() => { setEditando(null); setModalOpen(true) }}>
            <Plus size={16} /> {formTitulo || `Novo ${titulo}`}
          </button>
        )}
      />

      {/* Filtros */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-8" placeholder={`Buscar em ${titulo.toLowerCase()}...`} value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
          {filtros?.map(f => (
            <select key={f.key} className="select w-auto min-w-[150px]"
              value={filtroExtra[f.key] || ''}
              onChange={e => setFiltroExtra(p => ({ ...p, [f.key]: e.target.value }))}>
              <option value="">{f.label}</option>
              {[...new Set(dados.map(d => d[f.key]).filter(Boolean))].map(v => <option key={v}>{v}</option>)}
            </select>
          ))}
          {(busca || Object.values(filtroExtra).some(Boolean)) && (
            <button className="btn-ghost text-sm" onClick={() => { setBusca(''); setFiltroExtra({}) }}>Limpar filtros</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtrado.length === 0 ? (
        <EmptyState icon={Icone} title={`Nenhum registro em ${titulo}`}
          action={podeEditar && <button className="btn-primary" onClick={() => { setEditando(null); setModalOpen(true) }}><Plus size={15} className="inline mr-1" />Novo registro</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {colunas.map(c => (
                    <th key={c.key} className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">{c.label}</th>
                  ))}
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrado.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    {colunas.map(col => (
                      <td key={col.key} className="px-4 py-3">{renderCell(row, col)}</td>
                    ))}
                    <td className="px-4 py-3">
                      {podeEditar && (
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => { setEditando(row); setModalOpen(true) }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                          {podeExcluir && <button onClick={() => setDeletando(row)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>}
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

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditando(null) }}
        title={editando ? `Editar ${formTitulo || titulo}` : `Novo ${formTitulo || titulo}`} size="lg">
        <FormComponent inicial={editando} onSalvar={async form => { await onSalvar(form, editando); setModalOpen(false); setEditando(null) }}
          onCancelar={() => { setModalOpen(false); setEditando(null) }} />
      </Modal>

      <ConfirmDialog open={!!deletando} onClose={() => setDeletando(null)}
        onConfirm={async () => { await onDeletar(deletando.id); setDeletando(null) }}
        title={`Excluir registro`} message={`Excluir este registro? Esta ação não pode ser desfeita.`} danger />
    </div>
  )
}
