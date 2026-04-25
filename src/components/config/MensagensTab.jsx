import { useState } from 'react'
import { MessageSquare, Plus, Edit, Trash2, X, Check, AlertCircle } from 'lucide-react'

export default function MensagensTab() {
  const [mensagens, setMensagens] = useState([
    { id: 1, titulo: 'Sistema em manutenção', conteudo: 'Realizaremos manutenção no sábado à noite', tipo: 'warning', ativo: true },
    { id: 2, titulo: 'Nova feature disponível', conteudo: 'Confira os novos campos dinâmicos!', tipo: 'info', ativo: true },
  ])
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ titulo: '', conteudo: '', tipo: 'info' })

  const handleNova = () => {
    setForm({ titulo: '', conteudo: '', tipo: 'info' })
    setEditando(null)
    setFormAberto(true)
  }

  const handleEditar = (msg) => {
    setForm({ titulo: msg.titulo, conteudo: msg.conteudo, tipo: msg.tipo })
    setEditando(msg.id)
    setFormAberto(true)
  }

  const handleSalvar = () => {
    if (!form.titulo.trim() || !form.conteudo.trim()) {
      alert('⚠️ Preencha título e conteúdo')
      return
    }

    if (editando) {
      setMensagens(m => m.map(msg => msg.id === editando ? { ...msg, ...form } : msg))
      alert('✅ Mensagem atualizada')
    } else {
      setMensagens([...mensagens, { id: Date.now(), ...form, ativo: true }])
      alert('✅ Mensagem criada')
    }
    setFormAberto(false)
  }

  const handleDeletar = (id) => {
    if (window.confirm('Tem certeza?')) {
      setMensagens(m => m.filter(msg => msg.id !== id))
    }
  }

  const toggleAtivo = (id) => {
    setMensagens(m => m.map(msg => msg.id === id ? { ...msg, ativo: !msg.ativo } : msg))
  }

  const getTipoCor = (tipo) => {
    return {
      'info': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-blue-300',
      'warning': 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 border-amber-300',
      'success': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border-green-300',
      'error': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border-red-300',
    }[tipo] || ''
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <MessageSquare size={20} className="text-blue-600" />
            Mensagens do Sistema
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Comunicados exibidos em todas as páginas
          </p>
        </div>
        <button
          onClick={handleNova}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={16} /> Nova Mensagem
        </button>
      </div>

      {/* Lista de Mensagens */}
      <div className="space-y-3">
        {mensagens.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Nenhuma mensagem cadastrada
          </div>
        ) : (
          mensagens.map(msg => (
            <div
              key={msg.id}
              className={`p-4 border-l-4 rounded-lg transition-opacity ${getTipoCor(msg.tipo)} ${!msg.ativo ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{msg.titulo}</h4>
                  <p className="text-sm opacity-90">{msg.conteudo}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-black bg-opacity-10 rounded">
                      {msg.tipo.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${msg.ativo ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}>
                      {msg.ativo ? '✓ Ativo' : '✗ Inativo'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleAtivo(msg.id)}
                    className="p-2 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                    title={msg.ativo ? 'Desativar' : 'Ativar'}
                  >
                    {msg.ativo ? <Check size={16} /> : <X size={16} />}
                  </button>
                  <button
                    onClick={() => handleEditar(msg)}
                    className="p-2 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletar(msg.id)}
                    className="p-2 hover:bg-red-500 hover:bg-opacity-20 rounded transition-colors text-red-600"
                    title="Deletar"
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
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {editando ? '✏️ Editar Mensagem' : '➕ Nova Mensagem'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ex: Manutenção agendada"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Conteúdo *</label>
                <textarea
                  value={form.conteudo}
                  onChange={e => setForm({ ...form, conteudo: e.target.value })}
                  placeholder="Mensagem para os usuários..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="info">ℹ️ Informação</option>
                  <option value="warning">⚠️ Aviso</option>
                  <option value="success">✅ Sucesso</option>
                  <option value="error">❌ Erro</option>
                </select>
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
