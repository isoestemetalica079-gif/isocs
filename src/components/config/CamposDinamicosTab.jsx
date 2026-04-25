import { useState, useEffect } from 'react'
import { Trash2, Edit2, Plus, Loader2 } from 'lucide-react'
import { COLS, getAll, deleteDoc_, updateDoc_ } from '../../firebase/firestore'
import FormCampoDinamico from './forms/FormCampoDinamico'

export default function CamposDinamicosTab() {
  const [campos, setCampos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCampo, setSelectedCampo] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    loadCampos()
  }, [])

  const loadCampos = async () => {
    setLoading(true)
    try {
      const dados = await getAll(COLS.campos_dinamicos)
      setCampos(dados)
    } catch (err) {
      console.error('Erro ao carregar campos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCampo = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este campo?')) return
    try {
      await deleteDoc_(COLS.campos_dinamicos, id)
      setCampos(campos.filter(c => c.id !== id))
    } catch (err) {
      console.error('Erro ao deletar:', err)
      alert('Erro ao deletar campo')
    }
  }

  const handleToggleAtivo = async (campo) => {
    try {
      await updateDoc_(COLS.campos_dinamicos, campo.id, { ativo: !campo.ativo })
      setCampos(campos.map(c => c.id === campo.id ? { ...c, ativo: !c.ativo } : c))
    } catch (err) {
      console.error('Erro ao atualizar:', err)
    }
  }

  const handleEditCampo = (campo) => {
    setSelectedCampo(campo)
    setEditando(true)
    setShowForm(true)
  }

  const handleNewCampo = () => {
    setSelectedCampo(null)
    setEditando(false)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedCampo(null)
    setEditando(false)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadCampos()
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
            Gerenciar Campos Dinâmicos
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Total: {campos.length} campos
          </p>
        </div>
        <button
          onClick={handleNewCampo}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Novo Campo
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
                Campo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Obrigatório
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {campos.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Nenhum campo dinâmico cadastrado. Clique em "Novo Campo" para começar.
                </td>
              </tr>
            ) : (
              campos.map((campo) => (
                <tr
                  key={campo.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs font-medium">
                      {campo.nomeColecao}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                    {campo.nomeCampo}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                      {campo.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      campo.obrigatorio
                        ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                    }`}>
                      {campo.obrigatorio ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleToggleAtivo(campo)}
                      className={`inline-block px-2 py-1 rounded text-xs font-medium transition-colors ${
                        campo.ativo
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 cursor-pointer'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer'
                      }`}
                    >
                      {campo.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditCampo(campo)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCampo(campo.id)}
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
        <FormCampoDinamico
          inicial={selectedCampo}
          onSalvar={handleFormSuccess}
          onCancelar={handleFormClose}
          editando={editando}
        />
      )}
    </div>
  )
}
