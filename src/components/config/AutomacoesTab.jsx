import { useState } from 'react'
import { Zap, Plus, Trash2, Edit2, Check, X, Power } from 'lucide-react'

export default function AutomacoesTab() {
  const [automacoes, setAutomacoes] = useState([
    {
      id: 1,
      nome: 'Notificar quando orçamento é criado',
      trigger: 'CREATE',
      modulo: 'orcamentos',
      acao: 'NOTIFICAR',
      destinatario: 'gestor',
      condicao: 'status=PENDENTE',
      ativa: true,
    },
    {
      id: 2,
      nome: 'Enviar email quando projeto é finalizado',
      trigger: 'UPDATE',
      modulo: 'projetos',
      acao: 'EMAIL',
      destinatario: 'comercial',
      condicao: 'status=FINALIZADO',
      ativa: true,
    },
  ])
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({
    nome: '',
    trigger: 'CREATE',
    modulo: 'orcamentos',
    acao: 'NOTIFICAR',
    destinatario: 'gestor',
    condicao: '',
  })

  const handleNova = () => {
    setForm({
      nome: '',
      trigger: 'CREATE',
      modulo: 'orcamentos',
      acao: 'NOTIFICAR',
      destinatario: 'gestor',
      condicao: '',
    })
    setEditando(null)
    setFormAberto(true)
  }

  const handleEditar = (auto) => {
    setForm(auto)
    setEditando(auto.id)
    setFormAberto(true)
  }

  const handleSalvar = () => {
    if (!form.nome.trim()) {
      alert('⚠️ Preencha o nome da automação')
      return
    }

    if (editando) {
      setAutomacoes(a => a.map(auto => auto.id === editando ? { ...auto, ...form } : auto))
      alert('✅ Automação atualizada')
    } else {
      setAutomacoes([...automacoes, { id: Date.now(), ...form, ativa: true }])
      alert('✅ Automação criada')
    }
    setFormAberto(false)
  }

  const handleDeletar = (id) => {
    if (window.confirm('Deletar esta automação?')) {
      setAutomacoes(a => a.filter(auto => auto.id !== id))
    }
  }

  const toggleAtiva = (id) => {
    setAutomacoes(a => a.map(auto => auto.id === id ? { ...auto, ativa: !auto.ativa } : auto))
  }

  const getTriggerLabel = (trigger) => {
    return { 'CREATE': '➕ Criar', 'UPDATE': '✏️ Atualizar', 'DELETE': '🗑️ Deletar' }[trigger] || trigger
  }

  const getAcaoLabel = (acao) => {
    return {
      'NOTIFICAR': '🔔 Notificação',
      'EMAIL': '📧 Email',
      'WEBHOOK': '🪝 Webhook',
      'LOG': '📝 Log',
    }[acao] || acao
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <Zap size={20} className="text-blue-600" />
            Automações e Triggers
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Ações automáticas quando eventos ocorrem no sistema
          </p>
        </div>
        <button
          onClick={handleNova}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={16} /> Nova Automação
        </button>
      </div>

      {/* Lista de Automações */}
      <div className="space-y-3">
        {automacoes.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Nenhuma automação configurada
          </div>
        ) : (
          automacoes.map(auto => (
            <div
              key={auto.id}
              className={`p-4 border border-slate-200 dark:border-slate-700 rounded-lg transition-opacity ${
                auto.ativa ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{auto.nome}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      auto.ativa
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {auto.ativa ? '✓ Ativa' : '✗ Inativa'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs">
                      {getTriggerLabel(auto.trigger)} em {auto.modulo}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded text-xs">
                      {getAcaoLabel(auto.acao)} para {auto.destinatario}
                    </span>
                  </div>

                  {auto.condicao && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Se: <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">{auto.condicao}</code>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleAtiva(auto.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                    title={auto.ativa ? 'Desativar' : 'Ativar'}
                  >
                    {auto.ativa ? (
                      <Power size={16} className="text-green-600" />
                    ) : (
                      <Power size={16} className="text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEditar(auto)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors text-blue-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletar(auto.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Formulário */}
      {formAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {editando ? '✏️ Editar Automação' : '➕ Nova Automação'}
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nome da Automação *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Notificar ao criar orçamento"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Trigger</label>
                  <select
                    value={form.trigger}
                    onChange={e => setForm({ ...form, trigger: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="CREATE">Criar</option>
                    <option value="UPDATE">Atualizar</option>
                    <option value="DELETE">Deletar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Módulo</label>
                  <select
                    value={form.modulo}
                    onChange={e => setForm({ ...form, modulo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="orcamentos">Orçamentos</option>
                    <option value="projetos">Projetos</option>
                    <option value="art">ART</option>
                    <option value="calculos">Cálculos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Ação</label>
                  <select
                    value={form.acao}
                    onChange={e => setForm({ ...form, acao: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="NOTIFICAR">Notificação</option>
                    <option value="EMAIL">Email</option>
                    <option value="WEBHOOK">Webhook</option>
                    <option value="LOG">Log</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Destinatário</label>
                  <select
                    value={form.destinatario}
                    onChange={e => setForm({ ...form, destinatario: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="gestor">Gestor</option>
                    <option value="tecnico">Técnico</option>
                    <option value="comercial">Comercial</option>
                    <option value="controladoria">Controladoria</option>
                    <option value="todos">Todos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Condição (opcional)</label>
                <input
                  type="text"
                  value={form.condicao}
                  onChange={e => setForm({ ...form, condicao: e.target.value })}
                  placeholder="Ex: status=PENDENTE"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deixe em branco para aplicar sempre</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
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
