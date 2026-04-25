import { useEffect, useState } from 'react'
import { FileText, FolderKanban, Calculator, Award, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { getAll, COLS } from '../firebase/firestore'
import { useAuth } from '../contexts/AuthContext'

function KpiCard({ label, value, sub, icon: Icon, cor }) {
  const cores = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    teal:   'bg-teal-50 text-teal-600',
    red:    'bg-red-50 text-red-600',
  }
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cores[cor] || cores.blue}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function BarraStatus({ label, count, total, cor }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const cores = {
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-400',
    purple: 'bg-purple-400',
    slate: 'bg-slate-300',
  }
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-36 truncate">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${cores[cor] || 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{count}</span>
    </div>
  )
}

const fmtMoeda = v => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Dashboard() {
  const { perfil } = useAuth()
  const [dados, setDados] = useState({ orcamentos: [], projetos: [], calculos: [], art: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAll(COLS.orcamentos),
      getAll(COLS.projetos),
      getAll(COLS.calculos),
      getAll(COLS.art),
    ]).then(([orcamentos, projetos, calculos, art]) => {
      setDados({ orcamentos, projetos, calculos, art })
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { orcamentos, projetos, calculos, art } = dados

  // KPIs Orçamentos
  const totalOrc = orcamentos.length
  const valorOrc = orcamentos.reduce((a, o) => a + (Number(o.valorTotal) || 0), 0)
  const fechados = orcamentos.filter(o => o.fechado === 'SIM')
  const valorFechado = fechados.reduce((a, o) => a + (Number(o.rFechado) || 0), 0)
  const taxaConversao = totalOrc > 0 ? Math.round((fechados.length / totalOrc) * 100) : 0

  // Status orçamentos
  const statusOrc = orcamentos.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1; return acc
  }, {})

  // Status projetos
  const statusProj = projetos.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1; return acc
  }, {})

  // Por mês (últimos 6 meses dos orçamentos)
  const mesesOrd = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
  const porMes = mesesOrd.map(m => ({
    mes: m.slice(0,3),
    count: orcamentos.filter(o => o.mes === m).length,
    valor: orcamentos.filter(o => o.mes === m).reduce((a, o) => a + (Number(o.valorTotal) || 0), 0)
  })).filter(m => m.count > 0).slice(-6)

  const STATUS_ORC_CORES = { 'PENDENTE': 'yellow', 'EM ANÁLISE': 'teal', 'APROVADO': 'purple', 'FINALIZADO': 'green', 'CANCELADO': 'red', 'NÃO FECHADO': 'slate' }
  const STATUS_PROJ_CORES = { 'PENDENTE': 'yellow', 'APROVAÇÃO CLIENTE': 'teal', 'COMPATIBILIZAÇÃO': 'purple', 'CADASTRO': 'teal', 'CONTROLADORIA': 'orange', 'IMPLANTAÇÃO': 'teal', 'FINALIZADO': 'green', 'CANCELADO': 'red' }

  return (
    <div className="p-6 space-y-6">
      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Olá, {perfil?.nome?.split(' ')[0] || 'bem-vindo'} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral do departamento</p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Orçamentos" value={totalOrc} sub={fmtMoeda(valorOrc)} icon={FileText} cor="blue" />
        <KpiCard label="Fechados" value={fechados.length} sub={`${taxaConversao}% conversão`} icon={CheckCircle} cor="green" />
        <KpiCard label="Projetos Ativos" value={projetos.filter(p => !['FINALIZADO','CANCELADO'].includes(p.status)).length} sub={`${projetos.length} total`} icon={FolderKanban} cor="purple" />
        <KpiCard label="R$ Fechado" value={fmtMoeda(valorFechado)} sub="Valor contratado" icon={TrendingUp} cor="teal" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Cálculos" value={calculos.length} icon={Calculator} cor="orange" />
        <KpiCard label="ARTs" value={art.length} sub={`${art.filter(a => a.fechado === 'SIM').length} fechadas`} icon={Award} cor="blue" />
        <KpiCard label="Pendentes" value={orcamentos.filter(o => o.status === 'PENDENTE').length} icon={Clock} cor="orange" />
        <KpiCard label="Cancelados" value={orcamentos.filter(o => o.status === 'CANCELADO').length} icon={AlertCircle} cor="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Status Orçamentos */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Status dos Orçamentos</h2>
          <div className="space-y-3">
            {Object.entries(statusOrc).sort((a,b) => b[1]-a[1]).map(([s, c]) => (
              <BarraStatus key={s} label={s} count={c} total={totalOrc} cor={STATUS_ORC_CORES[s] || 'blue'} />
            ))}
            {Object.keys(statusOrc).length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nenhum orçamento cadastrado</p>}
          </div>
        </div>

        {/* Status Projetos */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Status dos Projetos</h2>
          <div className="space-y-3">
            {Object.entries(statusProj).sort((a,b) => b[1]-a[1]).map(([s, c]) => (
              <BarraStatus key={s} label={s} count={c} total={projetos.length} cor={STATUS_PROJ_CORES[s] || 'blue'} />
            ))}
            {Object.keys(statusProj).length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nenhum projeto cadastrado</p>}
          </div>
        </div>
      </div>

      {/* Por mês */}
      {porMes.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Orçamentos por Mês</h2>
          <div className="flex items-end gap-4">
            {porMes.map(m => {
              const maxVal = Math.max(...porMes.map(x => x.valor), 1)
              const h = Math.max(Math.round((m.valor / maxVal) * 120), 8)
              return (
                <div key={m.mes} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {fmtMoeda(m.valor).replace('R$','').trim()}
                  </span>
                  <div className="w-full rounded-t-md transition-all" style={{ height: h, backgroundColor: '#1f7a95' }} />
                  <span className="text-xs text-slate-500">{m.mes}</span>
                  <span className="text-xs font-semibold text-slate-700">{m.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Resumo por repartição */}
      {['NEXFRAME','ISOTELHADO'].map(rep => {
        const orcs = orcamentos.filter(o => o.reparticao === rep)
        if (!orcs.length) return null
        return (
          <div key={rep} className="card p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-3">{rep}</h2>
            <div className="flex gap-6 flex-wrap text-sm">
              <div><span className="text-slate-500">Orçamentos: </span><strong>{orcs.length}</strong></div>
              <div><span className="text-slate-500">Valor total: </span><strong>{fmtMoeda(orcs.reduce((a,o) => a + (Number(o.valorTotal)||0), 0))}</strong></div>
              <div><span className="text-slate-500">Fechados: </span><strong className="text-green-700">{orcs.filter(o=>o.fechado==='SIM').length}</strong></div>
              <div><span className="text-slate-500">Área total: </span><strong>{orcs.reduce((a,o)=>a+(Number(o.area)||0),0).toLocaleString('pt-BR')} m²</strong></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
