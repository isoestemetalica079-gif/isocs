import { useState, useEffect } from 'react'
import { Lock, Eye, Edit, Trash2, Check, X } from 'lucide-react'

const MODULOS = [
  { id: 'orcamentos', nome: 'Orçamentos', icon: '📋' },
  { id: 'projetos', nome: 'Projetos Executivos', icon: '📊' },
  { id: 'art', nome: 'ART', icon: '🏗️' },
  { id: 'calculos', nome: 'Cálculos', icon: '🧮' },
  { id: 'relatorios', nome: 'Relatórios', icon: '📈' },
]

const PERFIS = [
  { id: 'gestor', label: 'Gestor', cor: 'blue' },
  { id: 'tecnico', label: 'Técnico', cor: 'green' },
  { id: 'comercial', label: 'Comercial', cor: 'purple' },
  { id: 'controladoria', label: 'Controladoria', cor: 'amber' },
]

export default function PermissoesTab() {
  const [permissoes, setPermissoes] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Inicializar com permissões padrão
    const permsDefault = {}
    MODULOS.forEach(mod => {
      permsDefault[mod.id] = {}
      PERFIS.forEach(perf => {
        permsDefault[mod.id][perf.id] = {
          visualizar: ['gestor', 'tecnico', 'comercial', 'controladoria'].includes(perf.id),
          editar: ['gestor', 'tecnico'].includes(perf.id),
          deletar: perf.id === 'gestor',
        }
      })
    })
    setPermissoes(permsDefault)
  }, [])

  const togglePermissao = (modulo, perfil, tipo) => {
    setPermissoes(p => ({
      ...p,
      [modulo]: {
        ...p[modulo],
        [perfil]: {
          ...p[modulo][perfil],
          [tipo]: !p[modulo][perfil][tipo]
        }
      }
    }))
  }

  const salvarPermissoes = async () => {
    setLoading(true)
    try {
      // Aqui você salvaria no Firestore
      console.log('Permissões salvas:', permissoes)
      alert('✅ Permissões atualizadas com sucesso!')
    } catch (err) {
      alert('❌ Erro ao salvar permissões')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <Lock size={20} className="text-blue-600" />
          Matriz de Permissões por Perfil
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Configure quem pode visualizar, editar ou deletar em cada módulo
        </p>
      </div>

      {/* Tabela de Permissões */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Módulo</th>
              {PERFIS.map(perf => (
                <th key={perf.id} colSpan={3} className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700">
                  {perf.label}
                </th>
              ))}
            </tr>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-2"></th>
              {PERFIS.map(perf => (
                <div key={perf.id} className="flex gap-1 justify-center">
                  <th className="px-2 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700">👁️</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">✏️</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">🗑️</th>
                </div>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULOS.map(mod => (
              <tr key={mod.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                  <span className="text-lg mr-2">{mod.icon}</span>{mod.nome}
                </td>
                {PERFIS.map(perf => (
                  <td key={`${mod.id}-${perf.id}`} colSpan={3} className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">
                    <div className="flex gap-1 justify-center">
                      {/* Visualizar */}
                      <button
                        onClick={() => togglePermissao(mod.id, perf.id, 'visualizar')}
                        className={`p-2 rounded text-xs transition-colors ${
                          permissoes[mod.id]?.[perf.id]?.visualizar
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                        title="Visualizar"
                      >
                        {permissoes[mod.id]?.[perf.id]?.visualizar ? <Check size={14} /> : <X size={14} />}
                      </button>
                      {/* Editar */}
                      <button
                        onClick={() => togglePermissao(mod.id, perf.id, 'editar')}
                        className={`p-2 rounded text-xs transition-colors ${
                          permissoes[mod.id]?.[perf.id]?.editar
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                        title="Editar"
                      >
                        {permissoes[mod.id]?.[perf.id]?.editar ? <Check size={14} /> : <X size={14} />}
                      </button>
                      {/* Deletar */}
                      <button
                        onClick={() => togglePermissao(mod.id, perf.id, 'deletar')}
                        className={`p-2 rounded text-xs transition-colors ${
                          permissoes[mod.id]?.[perf.id]?.deletar
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                        title="Deletar"
                      >
                        {permissoes[mod.id]?.[perf.id]?.deletar ? <Check size={14} /> : <X size={14} />}
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <button
          onClick={salvarPermissoes}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : '💾 Salvar Permissões'}
        </button>
      </div>
    </div>
  )
}
