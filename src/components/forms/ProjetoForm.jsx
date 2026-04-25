import { useState } from 'react'
import {
  STATUS, REPARTICOES, TIPOLOGIAS, EDIFICACOES,
  ESCOPOS, MESES, ESTADOS, AGUAS, RESPONSAVEIS, COMERCIAIS, MODALIDADES, METODOS
} from '../../data/dominios'
import Autocomplete from '../Autocomplete'
import { mergeSeguro, validarSelect, validarFluig, validarMF, validarTag } from '../../utils/validacoes'
import { sugerirCidades, CIDADES_BRASIL } from '../../utils/validacaoCidades'

const INITIAL = {
  status: 'PENDENTE', mf: '', fluig: '', mes: '', tag: '', reparticao: '',
  tipologia: '', edificacao: '', aguas: '', escopo: '', cliente: '',
  projeto: '', comercial: '', cidade: '', estado: '', area: '',
  previsaoImportacao: '',
  // Etapa: Proposta
  propostaAprovada: '', entradaAprovCliente: '', saidaAprovCliente: '', responsavelAprov: '',
  // Etapa: Compatibilização
  entradaCompatibilizacao: '', saidaCompatibilizacao: '', responsavelCompat: '',
  // Etapa: Cadastro / Controladoria
  entradaCadastro: '', entradaControladoria: '', saidaControladoria: '', saidaCadastro: '',
  // Etapa: Implantação
  entradaImplantacao: '', saidaImplantacao: '', responsavelImplant: '', nMfImplantada: '',
  // Financeiro
  peso: '', kgM2: '', orcado: '', importacao: '', rTotal: '',
  observacoes: ''
}

const DateField = ({ label, value, onChange }) => (
  <div>
    <label className="label">{label}</label>
    <input className="input" type="date" value={value || ''} onChange={e => onChange(e.target.value)} />
  </div>
)

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

export default function ProjetoForm({ inicial, onSalvar, onCancelar }) {
  const [form, setForm] = useState(mergeSeguro(INITIAL, inicial))
  const [loading, setLoading] = useState(false)
  const [erros, setErros] = useState({})
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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

  const handleAddNewComercial = (novoComercial) => {
    set('comercial', novoComercial)
  }

  const handleAddNewResponsavel = (field) => (novoResponsavel) => {
    set(field, novoResponsavel)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">

      {/* Preenchimento Inicial */}
      <section>
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">
          Preenchimento Inicial
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Status *</label>
            <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="">Selecione</option>
              {STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
            {erros.status && <p className="text-red-600 text-xs mt-1 font-medium">{erros.status}</p>}
          </div>
          <TextField label="MF" value={form.mf} onChange={v => set('mf', v)} placeholder="Ex: 12340 (5 números)" type="text" numbersOnly={true} />
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
              <option>ISM</option>
              <option>DRYFAST</option>
            </select>
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
            <label className="label">Comercial</label>
            <Autocomplete
              options={COMERCIAIS}
              value={form.comercial}
              onChange={v => set('comercial', v)}
              onAddNew={handleAddNewComercial}
              placeholder="Digite para buscar..."
            />
          </div>
        </div>
      </section>

      {/* Identificação */}
      <section>
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">
          Identificação
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Cliente *</label>
            <input className="input" type="text" autoComplete="off" value={form.cliente} onChange={e => set('cliente', e.target.value)} placeholder="Nome do cliente" />
            {erros.cliente && <p className="text-red-600 text-xs mt-1 font-medium">{erros.cliente}</p>}
          </div>
          <div>
            <label className="label">Projeto *</label>
            <input className="input" type="text" autoComplete="off" value={form.projeto} onChange={e => set('projeto', e.target.value)} placeholder="Nome do projeto" />
            {erros.projeto && <p className="text-red-600 text-xs mt-1 font-medium">{erros.projeto}</p>}
          </div>
          <div>
            <label className="label">Cidade</label>
            <Autocomplete
              options={CIDADES_BRASIL}
              value={form.cidade}
              onChange={v => set('cidade', v)}
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
          <TextField label="Área (m²)" value={form.area} onChange={v => set('area', v)} placeholder="0,00" type="number" />
          <DateField label="Previsão Importação" value={form.previsaoImportacao} onChange={v => set('previsaoImportacao', v)} />
        </div>
      </section>

      {/* Etapa: Proposta */}
      <section>
        <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 pb-2 border-b border-emerald-100">
          Etapa 1 — Proposta Aprovada
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DateField label="Proposta Aprovada" value={form.propostaAprovada} onChange={v => set('propostaAprovada', v)} />
          <DateField label="Entrada Aprov. Cliente" value={form.entradaAprovCliente} onChange={v => set('entradaAprovCliente', v)} />
          <DateField label="Saída Aprov. Cliente" value={form.saidaAprovCliente} onChange={v => set('saidaAprovCliente', v)} />
          <div>
            <label className="label">Responsável</label>
            <Autocomplete
              options={RESPONSAVEIS}
              value={form.responsavelAprov}
              onChange={v => set('responsavelAprov', v)}
              onAddNew={handleAddNewResponsavel('responsavelAprov')}
              placeholder="Selecione responsável..."
            />
          </div>
        </div>
      </section>

      {/* Etapa: Compatibilização */}
      <section>
        <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 pb-2 border-b border-emerald-100">
          Etapa 2 — Compatibilização
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <DateField label="Entrada Compatibilização" value={form.entradaCompatibilizacao} onChange={v => set('entradaCompatibilizacao', v)} />
          <DateField label="Saída Compatibilização" value={form.saidaCompatibilizacao} onChange={v => set('saidaCompatibilizacao', v)} />
          <div>
            <label className="label">Responsável</label>
            <Autocomplete
              options={RESPONSAVEIS}
              value={form.responsavelCompat}
              onChange={v => set('responsavelCompat', v)}
              onAddNew={handleAddNewResponsavel('responsavelCompat')}
              placeholder="Selecione responsável..."
            />
          </div>
        </div>
      </section>

      {/* Etapa: Cadastro / Controladoria */}
      <section>
        <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 pb-2 border-b border-emerald-100">
          Etapa 3 — Cadastro / Controladoria
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DateField label="Entrada Cadastro" value={form.entradaCadastro} onChange={v => set('entradaCadastro', v)} />
          <DateField label="Entrada Controladoria" value={form.entradaControladoria} onChange={v => set('entradaControladoria', v)} />
          <DateField label="Saída Controladoria" value={form.saidaControladoria} onChange={v => set('saidaControladoria', v)} />
          <DateField label="Saída Cadastro" value={form.saidaCadastro} onChange={v => set('saidaCadastro', v)} />
        </div>
      </section>

      {/* Etapa: Implantação */}
      <section>
        <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 pb-2 border-b border-emerald-100">
          Etapa 4 — Implantação
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DateField label="Entrada Implantação" value={form.entradaImplantacao} onChange={v => set('entradaImplantacao', v)} />
          <DateField label="Saída Implantação" value={form.saidaImplantacao} onChange={v => set('saidaImplantacao', v)} />
          <div>
            <label className="label">Responsável</label>
            <Autocomplete
              options={RESPONSAVEIS}
              value={form.responsavelImplant}
              onChange={v => set('responsavelImplant', v)}
              onAddNew={handleAddNewResponsavel('responsavelImplant')}
              placeholder="Selecione responsável..."
            />
          </div>
          <TextField label="Nº MF Implantada" value={form.nMfImplantada} onChange={v => set('nMfImplantada', v)} placeholder="Ex: 49193.27" />
        </div>
      </section>

      {/* Financeiro */}
      <section>
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">
          Financeiro
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TextField label="Peso (kg)" value={form.peso} onChange={v => set('peso', v)} type="number" placeholder="0,00" />
          <TextField label="KG/m²" value={form.kgM2} onChange={v => set('kgM2', v)} type="number" placeholder="0,00" />
          <div>
            <label className="label">Orçado</label>
            <select className="select" value={form.orcado} onChange={e => set('orcado', e.target.value)}>
              <option value="">Selecione</option>
              <option>SIM</option>
              <option>NÃO</option>
            </select>
          </div>
          <div>
            <label className="label">Importação</label>
            <select className="select" value={form.importacao} onChange={e => set('importacao', e.target.value)}>
              <option value="">Selecione</option>
              <option>SIM</option>
              <option>NÃO</option>
            </select>
          </div>
          <TextField label="R$ Total" value={form.rTotal} onChange={v => set('rTotal', v)} type="number" placeholder="0,00" />
        </div>
      </section>

      {/* Observações */}
      <div>
        <label className="label">Observações</label>
        <textarea className="input resize-none" rows={3} value={form.observacoes} onChange={e => set('observacoes', e.target.value)} placeholder="Observações adicionais..." />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" className="btn-secondary" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Projeto'}
        </button>
      </div>
    </form>
  )
}
