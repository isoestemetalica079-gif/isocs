import { useState } from 'react'
import { STATUS, REPARTICOES, TIPOLOGIAS, EDIFICACOES, MESES, ESTADOS, AGUAS, ESCOPOS, MODALIDADES, COMERCIAIS } from '../../data/dominios'
import Autocomplete from '../Autocomplete'

const INITIAL = {
  status: 'PENDENTE', fluig: '', obra: '', mes: '', modalidade: '',
  reparticao: '', tipologia: '', edificacao: '', aguas: '', escopo: '',
  cliente: '', comercial: '', cidade: '', estado: '', area: '', peso: '',
  mf: '', nArt: '', valorMat: '', valorMO: '', valorTotal: '',
  entrada: '', saida: '', responsavelTecnico: '', fechado: 'NÃO', observacoes: ''
}

export default function ARTForm({ inicial, onSalvar, onCancelar }) {
  const [form, setForm] = useState({ ...INITIAL, ...inicial })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const calcTotal = () => {
    const t = (Number(form.valorMat) || 0) + (Number(form.valorMO) || 0)
    set('valorTotal', t > 0 ? t : '')
  }

  const handleAddNewComercial = (novoComercial) => {
    set('comercial', novoComercial)
  }

  const handleAddNewResponsavel = (novoResponsavel) => {
    set('responsavelTecnico', novoResponsavel)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    await onSalvar(form)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">Preenchimento Inicial</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className="label">Status</label>
            <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="">Selecione</option>
              {STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="label">FLUIG</label>
            <input className="input" type="number" value={form.fluig} onChange={e => set('fluig', e.target.value)} /></div>
          <div><label className="label">MF</label>
            <input className="input" type="number" value={form.mf} onChange={e => set('mf', e.target.value)} /></div>
          <div><label className="label">Mês</label>
            <select className="select" value={form.mes} onChange={e => set('mes', e.target.value)}>
              <option value="">Selecione</option>
              {MESES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div><label className="label">Modalidade</label>
            <select className="select" value={form.modalidade} onChange={e => set('modalidade', e.target.value)}>
              <option value="">Selecione</option>
              {MODALIDADES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div><label className="label">Repartição</label>
            <select className="select" value={form.reparticao} onChange={e => set('reparticao', e.target.value)}>
              <option value="">Selecione</option>
              {REPARTICOES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div><label className="label">Tipologia</label>
            <select className="select" value={form.tipologia} onChange={e => set('tipologia', e.target.value)}>
              <option value="">Selecione</option>
              {TIPOLOGIAS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Edificação</label>
            <select className="select" value={form.edificacao} onChange={e => set('edificacao', e.target.value)}>
              <option value="">Selecione</option>
              {EDIFICACOES.map(ed => <option key={ed}>{ed}</option>)}
            </select>
          </div>
          <div><label className="label">Águas</label>
            <select className="select" value={form.aguas} onChange={e => set('aguas', e.target.value)}>
              <option value="">Selecione</option>
              {AGUAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div><label className="label">Escopo</label>
            <select className="select" value={form.escopo} onChange={e => set('escopo', e.target.value)}>
              <option value="">Selecione</option>
              {ESCOPOS.map(es => <option key={es}>{es}</option>)}
            </select>
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

      <section>
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">Identificação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Obra</label>
            <input className="input" value={form.obra} onChange={e => set('obra', e.target.value)} placeholder="Nome da obra" /></div>
          <div><label className="label">Cliente</label>
            <input className="input" value={form.cliente} onChange={e => set('cliente', e.target.value)} /></div>
          <div>
            <label className="label">Responsável Técnico</label>
            <Autocomplete
              options={RESPONSAVEIS}
              value={form.responsavelTecnico}
              onChange={v => set('responsavelTecnico', v)}
              onAddNew={handleAddNewResponsavel}
              placeholder="Selecione responsável..."
            />
          </div>
          <div><label className="label">Cidade</label>
            <input className="input" value={form.cidade} onChange={e => set('cidade', e.target.value)} /></div>
          <div><label className="label">Estado</label>
            <select className="select" value={form.estado} onChange={e => set('estado', e.target.value)}>
              <option value="">Selecione</option>
              {ESTADOS.map(es => <option key={es}>{es}</option>)}
            </select>
          </div>
          <div><label className="label">Área (m²)</label>
            <input className="input" type="number" step="0.01" value={form.area} onChange={e => set('area', e.target.value)} /></div>
          <div><label className="label">Peso (kg)</label>
            <input className="input" type="number" step="0.01" value={form.peso} onChange={e => set('peso', e.target.value)} /></div>
          <div><label className="label">Nº ART</label>
            <input className="input" value={form.nArt} onChange={e => set('nArt', e.target.value)} placeholder="Número da ART" /></div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">Valores (R$)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className="label">Valor Material</label>
            <input className="input" type="number" step="0.01" value={form.valorMat} onChange={e => set('valorMat', e.target.value)} onBlur={calcTotal} placeholder="0,00" /></div>
          <div><label className="label">Valor M.O.</label>
            <input className="input" type="number" step="0.01" value={form.valorMO} onChange={e => set('valorMO', e.target.value)} onBlur={calcTotal} placeholder="0,00" /></div>
          <div><label className="label">Valor Total</label>
            <div className="input bg-slate-50 font-semibold text-slate-900">
              {Number(form.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div><label className="label">Fechado?</label>
            <select className="select" value={form.fechado} onChange={e => set('fechado', e.target.value)}>
              <option>NÃO</option><option>SIM</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">Datas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Entrada</label>
            <input className="input" type="date" value={form.entrada} onChange={e => set('entrada', e.target.value)} /></div>
          <div><label className="label">Saída</label>
            <input className="input" type="date" value={form.saida} onChange={e => set('saida', e.target.value)} /></div>
        </div>
      </section>

      <div>
        <label className="label">Observações</label>
        <textarea className="input resize-none" rows={3} value={form.observacoes} onChange={e => set('observacoes', e.target.value)} />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" className="btn-secondary" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar ART'}
        </button>
      </div>
    </form>
  )
}
