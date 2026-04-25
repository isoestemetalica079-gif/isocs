import { useState, useEffect } from 'react'
import { Trash2, Edit2, Plus, Loader2 } from 'lucide-react'
import { COLS, getAll, deleteDoc_ } from '../../firebase/firestore'
import RegrasFormTab from './RegrasFormTab'

export default function RegrasTabelaTab() {
  const [regras, setRegras] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRegra, setSelectedRegra] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    loadRegras()
  }, [])

  const loadRegras = async () => {
    setLoading(true)
    try {
      const dados = await getAll(COLS.regras_condicionais)
      setRegras(dados)
    } catch (err) {
      console.error('Erro ao carregar regras:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRegra = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta regra?')) return
    try {
      await deleteDoc_(COLS.regras_condicionais, id)
      setRegras(regras.filter(r => r.id !== id))
    } catch (err) {
      console.error('Erro ao deletar:', err)
      alert('Erro ao deletar regra')
    }
  }

  const handleEditRegra = (regra) => {
    setSelectedRegra(regra)
    setEditando(true)
    setShowForm(true)
  }

  const handleNewRegra = () => {
    setSelectedRegra(null)
    setEditando(false)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedRegra(null)
    setEditando(false)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadRegras()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Gerenciar Regras Condicionais
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Total: {regras.length} regras
          </p>
        </div>
        <button
          onClick={handleNewRegra}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nova Regra
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Coleção
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Descrição
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Condição
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Ações
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Ferramentas
              </th>
            </tr>
          </thead>
          <tbody>
            {regras.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Nenhuma regra condicional cadastrada. Clique em "Nova Regra" para começar.
                </td>
              </tr>
            ) : (
              regras.map((regra) => (
                <tr
                  key={regra.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs font-medium">
                      {regra.nomeColecao}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                    {regra.descricao}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {regra.condicao?.campo} {regra.condicao?.operador} {JSON.stringify(regra.condicao?.valor)}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {regra.acoes?.length || 0} ações
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      regra.ativo
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {regra.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditRegra(regra)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRegra(regra.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <RegrasFormTab
          inicial={selectedRegra}
          onSalvar={handleFormSuccess}
          onCancelar={handleFormClose}
          editando={editando}
        />
      )}
    </div>
  )
}
