import { useState } from 'react'
import { BarChart3, Plus, Trash2, Edit2, Eye, EyeOff } from 'lucide-react'

export default function KpisTab() {
  const [kpis, setKpis] = useState([
    { id: 1, nome: 'Orçamentos Abertos', metrica: 'COUNT', colecao: 'orcamentos', filtro: 'status=PENDENTE', alvo: 50, visivel: true },
    { id: 2, nome: 'Valor Total Orçado', metrica: 'SUM', colecao: 'orcamentos', filtro: 'none', alvo: 1000000, visivel: true },
    { id: 3, nome: 'Projetos em Execução', metrica: 'COUNT', colecao: 'projetos', filtro: 'status=EM ANDAMENTO', alvo: 20, visivel: true },
  ])
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nome: '', metrica: 'COUNT', colecao: 'orcamentos', filtro: '', alvo: '' })

  const handleNova = () => {
    setForm({ nome: '', metrica: 'COUNT', colecao: 'orcamentos', filtro: '', alvo: '' })
    setEditando(null)
    setFormAberto(true)
  }

  const handleEditar = (kpi) => {
    setForm(kpi)
    setEditando(kpi.id)
    setFormAberto(true)
  }

  const handleSalvar = () => {
    if (!form.nome.trim() || !form.alvo) {
      alert('⚠️ Preencha nome e alvo')
      return
    }

    if (editando) {
      setKpis(k => k.map(kpi => kpi.id === editando ? { ...kpi, ...form } : kpi))
      alert('✅ KPI atualizado')
    } else {
      setKpis([...kpis, { id: Date.now(), ...form, visivel: true }])
      alert('✅ KPI criado')
    }
    setFormAberto(false)
  }

  const handleDeletar = (id) => {
    if (window.confirm('Deletar este KPI?')) {
      setKpis(k => k.filter(kpi => kpi.id !== id))
    }
  }

  const toggleVisivel = (id) => {
    setKpis(k => k.map(kpi => kpi.id === id ? { ...kpi, visivel: !kpi.visivel } : kpi))
  }

  const getMetricaLabel = (metrica) => {
    return { 'COUNT': 'Contagem', 'SUM': 'Somatório', 'AVG': 'Média', 'MAX': 'Máximo' }[metrica] || metrica
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <BarChart3 size={20} className="text-blue-600" />
            Indicadores de Desempenho (KPIs)
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Configure métricas que aparecem no dashboard
          </p>
        </div>
        <button
          onClick={handleNova}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={16} /> Novo KPI
        </button>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(kpi => (
          <div
            key={kpi.id}
            className={`p-4 border border-slate-200 dark:border-slate-700 rounded-lg transition-all ${
              kpi.visivel ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white">{kpi.nome}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {getMetricaLabel(kpi.metrica)} de {kpi.colecao}
                </p>
              </div>
              <button
                onClick={() => toggleVisivel(kpi.id)}
                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                title={kpi.visivel ? 'Ocultar' : 'Mostrar'}
              >
                {kpi.visivel ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            {/* Valor simulado */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-3 rounded mb-3">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">42</p>
              <p className="text-xs text-blue-700 dark:text-blue-200">Alvo: {kpi.alvo.toLocaleString('pt-BR')}</p>
            </div>

            {/* Filtro */}
            {kpi.filtro && kpi.filtro !== 'none' && (
              <p className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded mb-3 text-slate-700 dark:text-slate-300">
                🔍 {kpi.filtro}
              </p>
            )}

            {/* Botões */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEditar(kpi)}
                className="flex-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <Edit2 size={14} className="inline mr-1" /> Editar
              </button>
              <button
                onClick={() => handleDeletar(kpi.id)}
                className="flex-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <Trash2 size={14} className="inline mr-1" /> Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Formulário */}
      {formAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {editando ? '✏️ Editar KPI' : '➕ Novo KPI'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Orçamentos Abertos"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Métrica</label>
                  <select
                    value={form.metrica}
                    onChange={e => setForm({ ...form, metrica: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="COUNT">Contagem</option>
                    <option value="SUM">Somatório</option>
                    <option value="AVG">Média</option>
                    <option value="MAX">Máximo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Coleção</label>
                  <select
                    value={form.colecao}
                    onChange={e => setForm({ ...form, colecao: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="orcamentos">Orçamentos</option>
                    <option value="projetos">Projetos</option>
                    <option value="art">ART</option>
                    <option value="calculos">Cálculos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Filtro (opcional)</label>
                <input
                  type="text"
                  value={form.filtro}
                  onChange={e => setForm({ ...form, filtro: e.target.value })}
                  placeholder="Ex: status=PENDENTE"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Valor Alvo *</label>
                <input
                  type="number"
                  value={form.alvo}
                  onChange={e => setForm({ ...form, alvo: e.target.value })}
                  placeholder="Ex: 50"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setFormAberto(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
