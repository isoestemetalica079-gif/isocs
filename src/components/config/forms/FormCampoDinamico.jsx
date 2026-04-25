import { useState } from 'react'
import { X, Loader2, Type, Hash, List, Calendar, AlignLeft, ToggleLeft, Mail, HelpCircle } from 'lucide-react'
import { COLS, addDoc_, updateDoc_ } from '../../../firebase/firestore'

const FORMULARIOS = [
  { value: 'orcamentos', label: 'Orçamentos', desc: 'Formulário de controle de orçamentos' },
  { value: 'projetos', label: 'Projetos Executivos', desc: 'Formulário de projetos em execução' },
  { value: 'art', label: 'ART', desc: 'Formulário de Anotação de Responsabilidade Técnica' },
  { value: 'calculos', label: 'Cálculos', desc: 'Formulário de cálculos técnicos' },
  { value: 'arquitetura', label: 'Arquitetura', desc: 'Formulário de projetos de arquitetura' },
]

const TIPOS_CAMPO = [
  { value: 'text', icon: Type, label: 'Texto', desc: 'Para nomes, endereços, descrições curtas' },
  { value: 'number', icon: Hash, label: 'Número', desc: 'Para valores, quantidades, medidas' },
  { value: 'select', icon: List, label: 'Lista de Opções', desc: 'Para escolher entre opções fixas (ex: Status, Tipo)' },
  { value: 'date', icon: Calendar, label: 'Data', desc: 'Para datas de entrada, prazo, fechamento' },
  { value: 'textarea', icon: AlignLeft, label: 'Texto Longo', desc: 'Para observações, comentários, detalhes' },
  { value: 'checkbox', icon: ToggleLeft, label: 'Sim / Não', desc: 'Para marcar se algo é verdadeiro ou falso' },
  { value: 'email', icon: Mail, label: 'E-mail', desc: 'Para endereços de e-mail' },
]

const INITIAL = {
  nomeColecao: '',
  nomeCampo: '',
  tipo: 'text',
  label: '',
  obrigatorio: false,
  ordem: 0,
  secao: '',
  opcoes: [],
  validacoes: { min: null, max: null, regex: '', mensagem: '' },
  ativo: true
}

function gerarNomeTecnico(label) {
  return label
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
}

export default function FormCampoDinamico({ inicial, onSalvar, onCancelar, editando }) {
  const [form, setForm] = useState(inicial ? { ...INITIAL, ...inicial } : INITIAL)
  const [loading, setLoading] = useState(false)
  const [opcoesInput, setOpcoesInput] = useState(inicial?.opcoes?.join('\n') || '')
  const [labelDigitado, setLabelDigitado] = useState(!!inicial)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleLabelChange = (label) => {
    set('label', label)
    if (!editando && !labelDigitado) {
      set('nomeCampo', gerarNomeTecnico(label))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nomeColecao) { alert('Selecione em qual formulário esse campo vai aparecer.'); return }
    if (!form.label) { alert('Informe como o campo vai aparecer na tela.'); return }
    if (!form.tipo) { alert('Selecione o tipo de informação que esse campo vai guardar.'); return }

    setLoading(true)
    try {
      const dados = {
        ...form,
        nomeCampo: form.nomeCampo || gerarNomeTecnico(form.label),
        opcoes: opcoesInput.split('\n').map(o => o.trim()).filter(o => o.length > 0)
      }

      if (editando && inicial?.id) {
        delete dados.nomeCampo
        await updateDoc_(COLS.campos_dinamicos, inicial.id, dados)
      } else {
        await addDoc_(COLS.campos_dinamicos, dados)
      }

      onSalvar()
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar campo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const tipoSelecionado = TIPOS_CAMPO.find(t => t.value === form.tipo)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {editando ? 'Editar Campo' : 'Criar Novo Campo'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {editando ? 'Atualize as informações do campo.' : 'Adicione um novo campo ao formulário.'}
            </p>
          </div>
          <button onClick={onCancelar} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-7">

          {/* Passo 1: Em qual formulário? */}
          <div>
            <label className="block text-base font-semibold text-slate-800 dark:text-white mb-1">
              1. Em qual formulário esse campo vai aparecer? *
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Escolha o formulário onde o campo será exibido.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {FORMULARIOS.map(f => (
                <label
                  key={f.value}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
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
                  <div>
                    <span className="font-medium text-slate-800 dark:text-white">{f.label}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">— {f.desc}</span>
                  </div>
                </label>
              ))}
            </div>
            {editando && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">O formulário não pode ser alterado após a criação.</p>}
          </div>

          {/* Passo 2: Como o campo vai aparecer */}
          <div>
            <label className="block text-base font-semibold text-slate-800 dark:text-white mb-1">
              2. Como o campo vai aparecer na tela? *
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Esse texto ficará visível para os usuários no formulário.
            </p>
            <input
              required
              type="text"
              value={form.label}
              onChange={e => handleLabelChange(e.target.value)}
              onBlur={() => setLabelDigitado(true)}
              placeholder="Ex: Data de Entrada, Valor do Contrato, Cidade da Obra..."
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-base"
            />
          </div>

          {/* Passo 3: Tipo de informação */}
          <div>
            <label className="block text-base font-semibold text-slate-800 dark:text-white mb-1">
              3. Que tipo de informação esse campo vai guardar? *
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Escolha o tipo que melhor descreve o dado que será preenchido.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_CAMPO.map(tipo => {
                const Icon = tipo.icon
                return (
                  <label
                    key={tipo.value}
                    className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-400 ${
                      form.tipo === tipo.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value={tipo.value}
                      checked={form.tipo === tipo.value}
                      onChange={() => set('tipo', tipo.value)}
                      className="w-4 h-4 text-blue-600 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Icon size={14} className="text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-slate-800 dark:text-white text-sm">{tipo.label}</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">{tipo.desc}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Opções para tipo=select */}
          {form.tipo === 'select' && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <label className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                Quais são as opções disponíveis para escolha?
              </label>
              <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                Digite uma opção por linha. O usuário poderá escolher entre essas opções.
              </p>
              <textarea
                value={opcoesInput}
                onChange={e => setOpcoesInput(e.target.value)}
                placeholder={"Pendente\nAprovado\nReprovado\nEm andamento"}
                rows={4}
                className="w-full px-3 py-2 border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm"
              />
            </div>
          )}

          {/* Passo 4: Obrigatório */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.obrigatorio}
                onChange={e => set('obrigatorio', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 mt-0.5"
              />
              <div>
                <span className="block text-base font-semibold text-slate-800 dark:text-white">
                  4. Esse campo é obrigatório?
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Se marcado, o usuário não poderá salvar o formulário sem preencher esse campo.
                </span>
              </div>
            </label>
          </div>

          {/* Configurações adicionais (colapsadas) */}
          <details className="border border-slate-200 dark:border-slate-700 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2 select-none hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
              <HelpCircle size={16} />
              Configurações adicionais (opcional)
            </summary>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Em qual seção do formulário? (opcional)
                  </label>
                  <input
                    type="text"
                    value={form.secao}
                    onChange={e => set('secao', e.target.value)}
                    placeholder="Ex: Financeiro, Identificação..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Posição (menor número aparece primeiro)
                  </label>
                  <input
                    type="number"
                    value={form.ordem}
                    onChange={e => set('ordem', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {(form.tipo === 'text' || form.tipo === 'number') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {form.tipo === 'number' ? 'Valor mínimo permitido' : 'Mínimo de caracteres'}
                    </label>
                    <input
                      type="number"
                      value={form.validacoes?.min || ''}
                      onChange={e => set('validacoes', { ...form.validacoes, min: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Sem limite"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {form.tipo === 'number' ? 'Valor máximo permitido' : 'Máximo de caracteres'}
                    </label>
                    <input
                      type="number"
                      value={form.validacoes?.max || ''}
                      onChange={e => set('validacoes', { ...form.validacoes, max: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Sem limite"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mensagem quando o valor for inválido (opcional)
                </label>
                <input
                  type="text"
                  value={form.validacoes?.mensagem || ''}
                  onChange={e => set('validacoes', { ...form.validacoes, mensagem: e.target.value })}
                  placeholder="Ex: Digite um número entre 1 e 100"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={e => set('ativo', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Campo ativo</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">— Desmarque para ocultar o campo sem excluir</span>
                </div>
              </label>
            </div>
          </details>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onCancelar} className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {editando ? 'Salvar Alterações' : 'Criar Campo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
