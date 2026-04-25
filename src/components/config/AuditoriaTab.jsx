import { useState, useEffect } from 'react'
import { Activity, User, Clock, FileText, Search } from 'lucide-react'

const TIPO_ICONS = {
  'CREATE': '➕',
  'UPDATE': '✏️',
  'DELETE': '🗑️',
  'LOGIN': '🔓',
  'LOGOUT': '🔐',
  'EXPORT': '📤',
}

export default function AuditoriaTab() {
  const [logs, setLogs] = useState([])
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de logs do Firestore
    setTimeout(() => {
      setLogs([
        { id: 1, usuario: 'Henrique', tipo: 'LOGIN', acao: 'Login realizado', timestamp: new Date(Date.now() - 2000), modulo: 'Dashboard' },
        { id: 2, usuario: 'Henrique', tipo: 'CREATE', acao: 'Novo orçamento criado', timestamp: new Date(Date.now() - 5000), modulo: 'Orcamentos' },
        { id: 3, usuario: 'João', tipo: 'UPDATE', acao: 'Orçamento #123 atualizado', timestamp: new Date(Date.now() - 10000), modulo: 'Orcamentos' },
        { id: 4, usuario: 'Maria', tipo: 'EXPORT', acao: 'Relatório exportado para PDF', timestamp: new Date(Date.now() - 15000), modulo: 'Relatorios' },
        { id: 5, usuario: 'Henrique', tipo: 'DELETE', acao: 'Projeto deletado', timestamp: new Date(Date.now() - 20000), modulo: 'Projetos' },
      ])
      setLoading(false)
    }, 800)
  }, [])

  const logsFiltrados = logs.filter(log => {
    const matchUsuario = !filtroUsuario || log.usuario.toLowerCase().includes(filtroUsuario.toLowerCase())
    const matchTipo = !filtroTipo || log.tipo === filtroTipo
    return matchUsuario && matchTipo
  })

  const formatarHora = (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin text-blue-600"><Activity size={32} /></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Activity size={20} className="text-blue-600" />
          Log de Ações do Sistema
        </h3>

        {/* Filtros */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filtrar por usuário..."
              value={filtroUsuario}
              onChange={e => setFiltroUsuario(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
          >
            <option value="">Todos os tipos</option>
            {Object.keys(TIPO_ICONS).map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Tipo</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Usuário</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Módulo</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Ação</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {logsFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Nenhum log encontrado
                </td>
              </tr>
            ) : (
              logsFiltrados.map(log => (
                <tr
                  key={log.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium">
                      {TIPO_ICONS[log.tipo]} {log.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    {log.usuario}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded">
                      {log.modulo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{log.acao}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                    <Clock size={12} />
                    {formatarHora(log.timestamp)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumo */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded text-sm text-blue-800 dark:text-blue-200">
        📊 Total de {logs.length} ações registradas | Mostrando {logsFiltrados.length} resultado(s)
      </div>
    </div>
  )
}
