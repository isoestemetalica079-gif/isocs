import { useState } from 'react'
import { X, Loader2, Plus, Trash2, ArrowRight, Lightbulb } from 'lucide-react'
import { COLS, addDoc_, updateDoc_ } from '../../firebase/firestore'

const FORMULARIOS = [
  { value: 'orcamentos', label: 'Orçamentos' },
  { value: 'projetos', label: 'Projetos Executivos' },
  { value: 'art', label: 'ART' },
  { value: 'calculos', label: 'Cálculos' },
  { value: 'arquitetura', label: 'Arquitetura' },
]

const OPERADORES = [
  { value: '==', label: 'é igual a', exemplo: 'Ex: Status é igual a "Aprovado"' },
  { value: '!=', label: 'é diferente de', exemplo: 'Ex: Status é diferente de "Cancelado"' },
  { value: '>', label: 'é maior que', exemplo: 'Ex: Valor é maior que 10000' },
  { value: '<', label: 'é menor que', exemplo: 'Ex: Área é menor que 50' },
  { value: '>=', label: 'é maior ou igual a', exemplo: 'Ex: Quantidade é maior ou igual a 1' },
  { value: '<=', label: 'é menor ou igual a', exemplo: 'Ex: Desconto é menor ou igual a 20' },
  { value: 'contains', label: 'contém o texto', exemplo: 'Ex: Observação contém "urgente"' },
]

const TIPOS_ACAO = [
  { value: 'mostrar', label: 'Mostrar um campo', desc: 'Exibir um campo que estava oculto' },
  { value: 'ocultar', label: 'Ocultar um campo', desc: 'Esconder um campo do formulário' },
  { value: 'alert', label: 'Exibir aviso', desc: 'Mostrar uma mensagem de atenção para o usuário' },
  { value: 'validar', label: 'Validar dados', desc: 'Impedir o salvamento se a condição não for atendida' },
  { value: 'calcular_automatico', label: 'Calcular automaticamente', desc: 'Preencher um campo com base em outros valores' },
]

const INITIAL = {
  nomeColecao: '',
  descricao: '',
  condicao: { campo: '', operador: '==', valor: '' },
  acoes: [],
  ativo: true,
  ordem: 0
}

export default function RegrasFormTab({ inicial, onSalvar, onCancelar, editando }) {
  const [form, setForm] = useState(inicial ? { ...INITIAL, ...inicial } : INITIAL)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setCondicao = (k, v) => setForm(f => ({ ...f, condicao: { ...f.condicao, [k]: v } }))

  const addAcao = () => setForm(f => ({
    ...f,
    acoes: [...f.acoes, { tipo: 'mostrar', alvo: '', mensagem: '' }]
  }))

  const removeAcao = (i) => setForm(f => ({ ...f, acoes: f.acoes.filter((_, idx) => idx !== i) }))

  const updateAcao = (i, campo, valor) => setForm(f => ({
    ...f,
    acoes: f.acoes.map((a, idx) => idx === i ? { ...a, [campo]: valor } : a)
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nomeColecao) { alert('Selecione em qual formulário essa regra se aplica.'); return }
    if (!form.condicao.campo) { alert('Informe qual campo será verificado na condição.'); return }
    if (!form.condicao.valor) { alert('Informe o valor da condição.'); return }
    if (form.acoes.length === 0) { alert('Adicione pelo menos uma ação a ser executada.'); return }

    setLoading(true)
    try {
      if (editando && inicial?.id) {
        await updateDoc_(COLS.regras_condicionais, inicial.id, form)
      } else {
        await addDoc_(COLS.regras_condicionais, form)
      }
      onSalvar()
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar regra. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const operadorSelecionado = OPERADORES.find(o => o.value === form.condicao.operador)
  const resumoRegra = form.condicao.campo && form.condicao.valor
    ? `SE o campo "${form.condicao.campo}" ${operadorSelecionado?.label || ''} "${form.condicao.valor}"`
    : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {editando ? 'Editar Regra' : 'Criar Nova Regra'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Defina o que acontece automaticamente quando uma condição for atendida.
            </p>
          </div>
          <button onClick={onCancelar} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Exemplo explicativo */}
        <div className="mx-6 mt-5 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-3">
          <Lightbulb size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Como funciona?</strong> Você define uma condição ("SE...") e uma ação ("ENTÃO...").
            Por exemplo: <em>SE o Status for "Aprovado", ENTÃO mostrar o campo "Data de Assinatura".</em>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-7">

          {/* Em qual formulário */}
          <div>
            <label className="block text-base font-semibold text-slate-800 dark:text-white mb-1">
              Em qual formulário essa regra se aplica? *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FORMULARIOS.map(f => (
                <label
                  key={f.value}
                  className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    editando ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-400'
                  } ${
                    form.nomeColecao === f.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="formulario"
                    value={f.value}
                    disabled={editando}
                    checked={form.nomeColecao === f.value}
                    onChange={() => set('nomeColecao', f.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-slate-800 dark:text-white">{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-base font-semibold text-slate-800 dark:text-white mb-1">
              Descreva essa regra em palavras simples *
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Ajuda a identificar a regra depois. Ex: "Mostrar data de assinatura quando aprovado"
            </p>
            <input
              required
              type="text"
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              placeholder="Ex: Se o orçamento for aprovado, mostrar campo de data..."
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Condição SE */}
          <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5 bg-blue-50 dark:bg-blue-950">
            <h3 className="text-base font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">SE</span>
              Quando isso acontecer...
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Qual campo será verificado?
                </label>
                <input
                  required
                  type="text"
                  value={form.condicao.campo}
                  onChange={e => setCondicao('campo', e.target.value)}
                  placeholder="Ex: status, fechado, valorTotal..."
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Use o nome exato do campo como aparece no sistema.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Qual é a comparação?
                </label>
                <select
                  required
                  value={form.condicao.operador}
                  onChange={e => setCondicao('operador', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {OPERADORES.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
                {operadorSelecionado && (
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{operadorSelecionado.exemplo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Qual valor? *
                </label>
                <input
                  required
                  type="text"
                  value={form.condicao.valor}
                  onChange={e => setCondicao('valor', e.target.value)}
                  placeholder='Ex: "SIM", "APROVADO", "500"...'
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Preview da regra */}
          {resumoRegra && (
            <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm text-slate-700 dark:text-slate-300">
              <span className="font-medium text-blue-700 dark:text-blue-300">{resumoRegra}</span>
            </div>
          )}

          {/* Ações ENTÃO */}
          <div className="border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-5 bg-emerald-50 dark:bg-emerald-950">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">ENTÃO</span>
                Faça isso...
              </h3>
              <button
                type="button"
                onClick={addAcao}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={14} />
                Adicionar Ação
              </button>
            </div>

            {form.acoes.length === 0 && (
              <div className="text-center py-6 text-emerald-700 dark:text-emerald-300 text-sm">
                Clique em "Adicionar Ação" para definir o que acontecerá quando a condição for atendida.
              </div>
            )}

            <div className="space-y-3">
              {form.acoes.map((acao, idx) => {
                const tipoInfo = TIPOS_ACAO.find(t => t.value === acao.tipo)
                return (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Ação {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAcao(idx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        O que vai acontecer?
                      </label>
                      <select
                        value={acao.tipo}
                        onChange={e => updateAcao(idx, 'tipo', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        {TIPOS_ACAO.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                        ))}
                      </select>
                      {tipoInfo && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tipoInfo.desc}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        {acao.tipo === 'alert' ? 'Mensagem a exibir' : 'Qual campo será afetado?'}
                      </label>
                      <input
                        type="text"
                        value={acao.tipo === 'alert' ? (acao.mensagem || '') : (acao.alvo || '')}
                        onChange={e => updateAcao(idx, acao.tipo === 'alert' ? 'mensagem' : 'alvo', e.target.value)}
                        placeholder={
                          acao.tipo === 'alert'
                            ? 'Ex: Atenção! Verifique os dados antes de salvar.'
                            : 'Ex: dataAssinatura, mesFechamento...'
                        }
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Preview final */}
          {resumoRegra && form.acoes.length > 0 && (
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Resumo da regra</p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-medium">SE</span>
                <span className="text-slate-700 dark:text-slate-300">{resumoRegra.replace('SE ', '')}</span>
                <ArrowRight size={16} className="text-slate-400" />
                <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded font-medium">ENTÃO</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {form.acoes.map(a => TIPOS_ACAO.find(t => t.value === a.tipo)?.label).filter(Boolean).join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* Status ativo */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={e => set('ativo', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Regra ativa</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">— Desmarque para desativar sem excluir</span>
            </div>
          </label>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onCancelar} className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {editando ? 'Salvar Alterações' : 'Criar Regra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
