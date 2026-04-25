import { useState } from 'react'
import { TIPOLOGIAS, MESES, ESTADOS, ESCOPOS, RESPONSAVEIS } from '../../data/dominios'
import Autocomplete from '../Autocomplete'

const INITIAL = {
  id: '', mf: '', fluig: '', responsavel: '', tipologia: '', metodo: '',
  tecnico: '', cliente: '', projeto: '', comercial: '', cidade: '', estado: '',
  maoDeObra: '', area: '', escopo: '', rTotal: '', rMaterial: '', rMO: '',
  rFechado: '', desconto: '', kgAco: '', indice: '', entrada: '', saida: '',
  sla: '', lead: '', mes: '', observacoes: ''
}

export default function CalculoForm({ inicial, onSalvar, onCancelar, titulo = 'Cálculo' }) {
  const [form, setForm] = useState({ ...INITIAL, ...inicial })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    await onSalvar(form)
    setLoading(false)
  }

  const handleAddNewResponsavel = (novoResponsavel) => {
    set('responsavel', novoResponsavel)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">Identificação</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[['ID', 'id', 'text'], ['MF', 'mf', 'number'], ['FLUIG', 'fluig', 'number']].map(([l, k, t]) => (
            <div key={k}><label className="label">{l}</label>
              <input className="input" type={t} value={form[k] || ''} onChange={e => set(k, e.target.value)} /></div>
          ))}
          <div><label className="label">Mês</label>
            <select className="select" value={form.mes} onChange={e => set('mes', e.target.value)}>
              <option value="">Selecione</option>
              {MESES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div><label className="label">Tipologia</label>
            <select className="select" value={form.tipologia} onChange={e => set('tipologia', e.target.value)}>
              <option value="">Selecione</option>
              {TIPOLOGIAS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Escopo</label>
            <select className="select" value={form.escopo} onChange={e => set('escopo', e.target.value)}>
              <option value="">Selecione</option>
              {ESCOPOS.map(es => <option key={es}>{es}</option>)}
            </select>
          </div>
          {[['Método', 'metodo'], ['Técnico', 'tecnico']].map(([l, k]) => (
            <div key={k}><label className="label">{l}</label>
              <input className="input" value={form[k] || ''} onChange={e => set(k, e.target.value)} /></div>
          ))}
          <div><label className="label">Responsável</label>
            <Autocomplete
              options={RESPONSAVEIS}
              value={form.responsavel || ''}
              onChange={v => set('responsavel', v)}
              onAddNew={handleAddNewResponsavel}
              placeholder="Selecione responsável..."
            />
          </div>
          <div><label className="label">Cliente *</label>
            <input className="input" required value={form.cliente || ''} onChange={e => set('cliente', e.target.value)} /></div>
          <div><label className="label">Projeto *</label>
            <input className="input" required value={form.projeto || ''} onChange={e => set('projeto', e.target.value)} /></div>
          <div><label className="label">Comercial</label>
            <input className="input" value={form.comercial || ''} onChange={e => set('comercial', e.target.value)} /></div>
          <div><label className="label">Cidade</label>
            <input className="input" value={form.cidade || ''} onChange={e => set('cidade', e.target.value)} /></div>
          <div><label className="label">Estado</label>
            <select className="select" value={form.estado} onChange={e => set('estado', e.target.value)}>
              <option value="">Selecione</option>
              {ESTADOS.map(es => <option key={es}>{es}</option>)}
            </select>
          </div>
          <div><label className="label">Mão de Obra</label>
            <input className="input" value={form.maoDeObra || ''} onChange={e => set('maoDeObra', e.target.value)} /></div>
          <div><label className="label">Área (m²)</label>
            <input className="input" type="number" step="0.01" value={form.area || ''} onChange={e => set('area', e.target.value)} /></div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">Financeiro (R$)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[['R$ Total','rTotal'],['R$ Material','rMaterial'],['R$ M.O.','rMO'],['R$ Fechado','rFechado'],['Desconto','desconto'],['KG Aço','kgAco'],['Índice','indice']].map(([l, k]) => (
            <div key={k}><label className="label">{l}</label>
              <input className="input" type="number" step="0.01" value={form[k] || ''} onChange={e => set(k, e.target.value)} placeholder="0,00" /></div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-2 border-b border-blue-100">Prazos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[['Entrada','entrada'],['Saída','saida']].map(([l, k]) => (
            <div key={k}><label className="label">{l}</label>
              <input className="input" type="date" value={form[k] || ''} onChange={e => set(k, e.target.value)} /></div>
          ))}
          {[['SLA (dias)','sla'],['Lead (dias)','lead']].map(([l, k]) => (
            <div key={k}><label className="label">{l}</label>
              <input className="input" type="number" value={form[k] || ''} onChange={e => set(k, e.target.value)} /></div>
          ))}
        </div>
      </section>

      <div>
        <label className="label">Observações</label>
        <textarea className="input resize-none" rows={3} value={form.observacoes || ''} onChange={e => set('observacoes', e.target.value)} />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" className="btn-secondary" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : `Salvar ${titulo}`}
        </button>
      </div>
    </form>
  )
}
