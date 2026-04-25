import { useState } from 'react'
import { useUsuarios } from '../../hooks/useUsuarios'
import {
  STATUS, REPARTICOES, TIPOLOGIAS, EDIFICACOES,
  ESCOPOS, MESES, ESTADOS, AGUAS, RESPONSAVEIS, COMERCIAIS, METODOS, TAGS
} from '../../data/dominios'
import Autocomplete from '../Autocomplete'
import { mergeSeguro, validarFormulario, validarSelect, validarFluig, validarMF, validarTag } from '../../utils/validacoes'
import { sugerirCidades, CIDADES_BRASIL } from '../../utils/validacaoCidades'

const TextField = ({ label, value, onChange, placeholder, type = 'text', numbersOnly = false }) => (
  <div>
    <label className="label">{label}</label>
    <input
      className="input"
      type={type}
      autoComplete="off"
      value={value || ''}
      onChange={e => {
        let val = e.target.value
        if (numbersOnly) val = val.replace(/\D/g, '') // Remove non-digits
        onChange(val)
      }}
      placeholder={placeholder}
    />
  </div>
)

const INITIAL = {
  status: 'PENDENTE', fluig: '', mes: '', tag: '', reparticao: '',
  tipologia: '', edificacao: '', aguas: '', escopo: '', cliente: '',
  projeto: '', comercial: '', cidade: '', estado: '', area: '',
  peso: '', mf: '', santri: '', metodologia: '', rRevest: '',
  rEstrutura: '', rMO: '', valorTotal: '', entradaFluig: '',
  saidaControladoria: '', responsavel: '', fechado: 'NÃO',
  mesFechamento: '', rFechado: '', observacoes: ''
}

export default function OrcamentoForm({ inicial, onSalvar, onCancelar }) {
  // Fix crítico: usar mergeSeguro para evitar undefined sobrescrevendo valores padrão
  const [form, setForm] = useState(mergeSeguro(INITIAL, inicial))
  const [loading, setLoading] = useState(false)
  const [erros, setErros] = useState({})
  const usuariosDisponiveis = useUsuarios()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Auto-calcula valor total
  const calcTotal = () => {
    const t = (Number(form.rRevest) || 0) + (Number(form.rEstrutura) || 0) + (Number(form.rMO) || 0)
    setForm(f => ({ ...f, valorTotal: t > 0 ? t : '' }))
  }

  const setComercial = (v) => setForm(f => ({ ...f, comercial: v }))
  const setCidade = (v) => setForm(f => ({ ...f, cidade: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    const novosErros = {}

    // Validar SELECTs obrigatórios
    if (!form.status) novosErros.status = 'Status é obrigatório'
    if (!form.mes) novosErros.mes = 'Mês é obrigatório'
    if (!form.reparticao) novosErros.reparticao = 'Repartição é obrigatória'
    if (!form.tipologia) novosErros.tipologia = 'Tipologia é obrigatória'
    if (!form.edificacao) novosErros.edificacao = 'Edificação é obrigatória'
    if (!form.aguas && form.aguas !== 0) novosErros.aguas = 'Águas é obrigatório'
    if (!form.escopo) novosErros.escopo = 'Escopo é obrigatório'
    if (!form.metodologia) novosErros.metodologia = 'Metodologia é obrigatória'

    // Validar campos de texto obrigatórios
    if (!form.cliente) novosErros.cliente = 'Cliente é obrigatório'
    if (!form.projeto) novosErros.projeto = 'Projeto é obrigatório'

    // Validar FLUIG (formato)
    if (form.fluig) {
      const valFluig = validarFluig(form.fluig)
      if (!valFluig.valido) novosErros.fluig = valFluig.erro
    }

    // Validar MF (formato)
    if (form.mf) {
      const valMF = validarMF(form.mf)
      if (!valMF.valido) novosErros.mf = valMF.erro
    }

    // Validar TAG (apenas ISM ou DRYFAST)
    if (form.tag) {
      const valTag = validarTag(form.tag)
      if (!valTag.valido) novosErros.tag = valTag.erro
    }

    // Se há erros, mostrar e retornar
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }

    // Se tudo OK, limpar erros e salvar
    setErros({})
    setLoading(true)
    try {
      await onSalvar(form)
    } catch (erro) {
      console.error('Erro ao salvar:', erro)
      novosErros.submit = 'Erro ao salvar. Tente novamente.'
      setErros(novosErros)
    } finally {
      setLoading(false)
    }
  }


  return (
    <form onSubmit={handleSubmit}>
      {/* Mensagem de Erro Geral */}
      {erros.submit && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Erro:</strong> {erros.submit}
        </div>
      )}

      {/* Seção 1: Preenchimento Inicial */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">
          Preenchimento Inicial
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Status *</label>
            <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="">Selecione</option>
              {STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
            {erros.status && <p className="text-red-600 text-xs mt-1 font-medium">{erros.status}</p>}
          </div>
          <TextField label="FLUIG" value={form.fluig} onChange={v => set('fluig', v)} placeholder="Ex: 168901 (6 números)" type="text" numbersOnly={true} />
          <div>
            <label className="label">Mês *</label>
            <select className="select" value={form.mes} onChange={e => set('mes', e.target.value)}>
              <option value="">Selecione</option>
              {MESES.map(m => <option key={m}>{m}</option>)}
            </select>
            {erros.mes && <p className="text-red-600 text-xs mt-1 font-medium">{erros.mes}</p>}
          </div>
          <div>
            <label className="label">TAG</label>
            <select className="select" value={form.tag} onChange={e => set('tag', e.target.value)}>
              <option value="">Selecione</option>
              {TAGS.map(t => <option key={t}>{t}</option>)}
            </select>
            {erros.tag && <p className="text-red-600 text-xs mt-1 font-medium">{erros.tag}</p>}
          </div>
          <div>
            <label className="label">Repartição *</label>
            <select className="select" value={form.reparticao} onChange={e => set('reparticao', e.target.value)}>
              <option value="">Selecione</option>
              {REPARTICOES.map(r => <option key={r}>{r}</option>)}
            </select>
            {erros.reparticao && <p className="text-red-600 text-xs mt-1 font-medium">{erros.reparticao}</p>}
          </div>
          <div>
            <label className="label">Tipologia *</label>
            <select className="select" value={form.tipologia} onChange={e => set('tipologia', e.target.value)}>
              <option value="">Selecione</option>
              {TIPOLOGIAS.map(t => <option key={t}>{t}</option>)}
            </select>
            {erros.tipologia && <p className="text-red-600 text-xs mt-1 font-medium">{erros.tipologia}</p>}
          </div>
          <div>
            <label className="label">Edificação *</label>
            <select className="select" value={form.edificacao} onChange={e => set('edificacao', e.target.value)}>
              <option value="">Selecione</option>
              {EDIFICACOES.map(ed => <option key={ed}>{ed}</option>)}
            </select>
            {erros.edificacao && <p className="text-red-600 text-xs mt-1 font-medium">{erros.edificacao}</p>}
          </div>
          <div>
            <label className="label">Águas *</label>
            <select className="select" value={form.aguas} onChange={e => set('aguas', e.target.value)}>
              <option value="">Selecione</option>
              {AGUAS.map(a => <option key={a}>{a}</option>)}
            </select>
            {erros.aguas && <p className="text-red-600 text-xs mt-1 font-medium">{erros.aguas}</p>}
          </div>
          <div>
            <label className="label">Escopo *</label>
            <select className="select" value={form.escopo} onChange={e => set('escopo', e.target.value)}>
              <option value="">Selecione</option>
              {ESCOPOS.map(es => <option key={es}>{es}</option>)}
            </select>
            {erros.escopo && <p className="text-red-600 text-xs mt-1 font-medium">{erros.escopo}</p>}
          </div>
          <div>
            <label className="label">Metodologia *</label>
            <select className="select" value={form.metodologia} onChange={e => set('metodologia', e.target.value)}>
              <option value="">Selecione</option>
              {METODOS.map(m => <option key={m}>{m}</option>)}
            </select>
            {erros.metodologia && <p className="text-red-600 text-xs mt-1 font-medium">{erros.metodologia}</p>}
          </div>
          <div>
            <label className="label">Comercial</label>
            <Autocomplete
              options={COMERCIAIS}
              value={form.comercial}
              onChange={setComercial}
              placeholder="Digite para buscar comercial..."
            />
          </div>
        </div>
      </div>

      {/* Seção 2: Identificação */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">
          Identificação
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Cliente *</label>
            <input type="text" autoComplete="off" className="input" value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))} placeholder="Nome do cliente" />
            {erros.cliente && <p className="text-red-600 text-xs mt-1 font-medium">{erros.cliente}</p>}
          </div>
          <div>
            <label className="label">Projeto *</label>
            <input type="text" autoComplete="off" className="input" value={form.projeto} onChange={e => setForm(f => ({ ...f, projeto: e.target.value }))} placeholder="Nome do projeto" />
            {erros.projeto && <p className="text-red-600 text-xs mt-1 font-medium">{erros.projeto}</p>}
          </div>
          <div>
            <label className="label">Responsável</label>
            <select className="select" value={form.responsavel} onChange={e => set('responsavel', e.target.value)}>
              <option value="">Selecione</option>
              {usuariosDisponiveis.map(u => <option key={u}>{u}</option>)}
            </select>
            {erros.responsavel && <p className="text-red-600 text-xs mt-1 font-medium">{erros.responsavel}</p>}
          </div>
          <div>
            <label className="label">Cidade</label>
            <Autocomplete
              options={CIDADES_BRASIL}
              value={form.cidade}
              onChange={setCidade}
              filterFn={sugerirCidades}
              placeholder="Digite para buscar cidade..."
            />
            {erros.cidade && <p className="text-red-600 text-xs mt-1 font-medium">{erros.cidade}</p>}
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="select" value={form.estado} onChange={e => set('estado', e.target.value)}>
              <option value="">Selecione</option>
              {ESTADOS.map(es => <option key={es}>{es}</option>)}
            </select>
            {erros.estado && <p className="text-red-600 text-xs mt-1 font-medium">{erros.estado}</p>}
          </div>
        </div>
      </div>

      {/* Seção 3: Dimensionamento */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">
          Dimensionamento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Área (m²)</label>
            <input className="input" type="number" step="0.01" value={form.area} onChange={e => set('area', e.target.value)} placeholder="0,00" />
          </div>
          <div>
            <label className="label">Peso (kg)</label>
            <input className="input" type="number" step="0.01" value={form.peso} onChange={e => set('peso', e.target.value)} placeholder="0,00" />
          </div>
          <TextField label="MF" value={form.mf} onChange={v => set('mf', v)} placeholder="Ex: 12340 (5 números)" type="text" numbersOnly={true} />
          <div>
            <label className="label">SANTRI</label>
            <input className="input" value={form.santri} onChange={e => set('santri', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Seção 4: Orçamento */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">
          Orçamento (R$)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">R$ Revestimento</label>
            <input className="input" type="number" step="0.01" value={form.rRevest} onChange={e => set('rRevest', e.target.value)} onBlur={calcTotal} placeholder="0,00" />
          </div>
          <div>
            <label className="label">R$ Estrutura</label>
            <input className="input" type="number" step="0.01" value={form.rEstrutura} onChange={e => set('rEstrutura', e.target.value)} onBlur={calcTotal} placeholder="0,00" />
          </div>
          <div>
            <label className="label">R$ Mão de Obra</label>
            <input className="input" type="number" step="0.01" value={form.rMO} onChange={e => set('rMO', e.target.value)} onBlur={calcTotal} placeholder="0,00" />
          </div>
          <div>
            <label className="label">Valor Total</label>
            <div className="input bg-slate-50 font-semibold text-slate-900">
              {Number(form.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>
      </div>

      {/* Seção 5: Datas e Fechamento */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">
          Datas e Fechamento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Entrada FLUIG</label>
            <input className="input" type="date" value={form.entradaFluig} onChange={e => set('entradaFluig', e.target.value)} />
          </div>
          <div>
            <label className="label">Saída Controladoria</label>
            <input className="input" type="date" value={form.saidaControladoria} onChange={e => set('saidaControladoria', e.target.value)} />
          </div>
          <div>
            <label className="label">Fechado?</label>
            <select className="select" value={form.fechado} onChange={e => set('fechado', e.target.value)}>
              <option>NÃO</option>
              <option>SIM</option>
            </select>
          </div>
          {form.fechado === 'SIM' && (
            <>
              <div>
                <label className="label">Mês Fechamento</label>
                <select className="select" value={form.mesFechamento} onChange={e => set('mesFechamento', e.target.value)}>
                  <option value="">Selecione</option>
                  {MESES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">R$ Fechado</label>
                <input className="input" type="number" step="0.01" value={form.rFechado} onChange={e => set('rFechado', e.target.value)} placeholder="0,00" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Observações */}
      <div className="mb-6">
        <label className="label">Observações</label>
        <textarea
          className="input resize-none" rows={3}
          value={form.observacoes} onChange={e => set('observacoes', e.target.value)}
          placeholder="Observações adicionais..."
        />
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" className="btn-secondary" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Orçamento'}
        </button>
      </div>
    </form>
  )
}
