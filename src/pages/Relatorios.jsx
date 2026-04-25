import { useEffect, useState, useMemo } from 'react'
import { Download, FileDown, BarChart3 } from 'lucide-react'
import { getAll, COLS } from '../firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { exportarOrcamentos, exportarProjetos, exportarBasePowerBI } from '../firebase/exportacao'
import PageHeader from '../components/PageHeader'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

const REPARTICIONES = ['ISOTELHADO', 'NEXFRAME', 'ISODRY', 'DRYFAST']
const CORES = ['#1f7a95', '#2bb3d4', '#0ea5a8', '#06b6d4', '#0891b2', '#0e7490']

export default function Relatorios() {
  const { perfil } = useAuth()
  const [dados, setDados] = useState({ orcamentos: [], projetos: [] })
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('orcamentos')
  const [relatorioGerado, setRelatorioGerado] = useState(false)

  // Filtros multi-select
  const [filtrosReparticao, setFiltrosReparticao] = useState([])
  const [filtrosStatus, setFiltrosStatus] = useState([])
  const [filtrosEdificacao, setFiltrosEdificacao] = useState([])
  const [filtrosEstado, setFiltrosEstado] = useState([])
  const [filtrosComercial, setFiltrosComercial] = useState([])
  const [filtrosResponsavel, setFiltrosResponsavel] = useState([])
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  useEffect(() => {
    Promise.all([
      getAll(COLS.orcamentos),
      getAll(COLS.projetos),
    ]).then(([orcamentos, projetos]) => {
      setDados({ orcamentos, projetos })
      setLoading(false)
    })
  }, [])

  // Extrair opções únicas dos filtros
  const opcoesUnicas = useMemo(() => {
    const todos = [...dados.orcamentos, ...dados.projetos]
    return {
      reparticao: [...new Set(todos.map(d => d.reparticao).filter(Boolean))].sort(),
      status: [...new Set(todos.map(d => d.status).filter(Boolean))].sort(),
      edificacao: [...new Set(todos.map(d => d.edificacao).filter(Boolean))].sort(),
      estado: [...new Set(todos.map(d => d.estado).filter(Boolean))].sort(),
      comercial: [...new Set(todos.map(d => d.comercial).filter(Boolean))].sort(),
      responsavel: [...new Set(todos.map(d => d.responsavel).filter(Boolean))].sort(),
    }
  }, [dados])

  const aplicarFiltros = (lista) => {
    return lista.filter(item => {
      if (filtrosReparticao.length > 0 && !filtrosReparticao.includes(item.reparticao)) return false
      if (filtrosStatus.length > 0 && !filtrosStatus.includes(item.status)) return false
      if (filtrosEdificacao.length > 0 && !filtrosEdificacao.includes(item.edificacao)) return false
      if (filtrosEstado.length > 0 && !filtrosEstado.includes(item.estado)) return false
      if (filtrosComercial.length > 0 && !filtrosComercial.includes(item.comercial)) return false
      if (filtrosResponsavel.length > 0 && !filtrosResponsavel.includes(item.responsavel)) return false

      if (dataInicio || dataFim) {
        const data = abaAtiva === 'orcamentos' ? item.entradaFluig : (item.entradaControladoria || item.entradaCadastro)
        if (data) {
          const dataStr = typeof data === 'string' ? data : data
          if (dataInicio && dataStr < dataInicio) return false
          if (dataFim && dataStr > dataFim) return false
        }
      }
      return true
    })
  }

  const orcamentosFiltrados = useMemo(() => aplicarFiltros(dados.orcamentos),
    [dados.orcamentos, filtrosReparticao, filtrosStatus, filtrosEdificacao, filtrosEstado, filtrosComercial, filtrosResponsavel, dataInicio, dataFim])

  const projetosFiltrados = useMemo(() => aplicarFiltros(dados.projetos),
    [dados.projetos, filtrosReparticao, filtrosStatus, filtrosEdificacao, filtrosEstado, filtrosComercial, filtrosResponsavel, dataInicio, dataFim])

  const filtradosAtivos = abaAtiva === 'orcamentos' ? orcamentosFiltrados : projetosFiltrados

  const toggleFiltro = (lista, valor) => {
    if (lista.includes(valor)) return lista.filter(v => v !== valor)
    return [...lista, valor]
  }

  const kpiOrcamentos = useMemo(() => {
    const total = orcamentosFiltrados.length
    const valor = orcamentosFiltrados.reduce((acc, o) => acc + (Number(o.valorTotal) || 0), 0)
    const fechados = orcamentosFiltrados.filter(o => o.fechado === 'SIM').length
    return { total, valor, fechados, taxa: total > 0 ? ((fechados / total) * 100).toFixed(1) : 0 }
  }, [orcamentosFiltrados])

  const kpiProjetos = useMemo(() => {
    const total = projetosFiltrados.length
    const valor = projetosFiltrados.reduce((acc, p) => acc + (Number(p.valorTotal) || 0), 0)
    const implantados = projetosFiltrados.filter(p => p.saidaImplantacao).length
    return { total, valor, implantados, taxa: total > 0 ? ((implantados / total) * 100).toFixed(1) : 0 }
  }, [projetosFiltrados])

  const kpiAtivo = abaAtiva === 'orcamentos' ? kpiOrcamentos : kpiProjetos

  const graficoReparticao = useMemo(() => {
    const agrupado = {}
    filtradosAtivos.forEach(item => {
      const rep = item.reparticao || 'Sem Repartição'
      if (!agrupado[rep]) agrupado[rep] = { reparticao: rep, quantidade: 0, valor: 0 }
      agrupado[rep].quantidade++
      agrupado[rep].valor += Number(item.valorTotal) || 0
    })
    return Object.values(agrupado).sort((a, b) => b.valor - a.valor)
  }, [filtradosAtivos])

  const graficoStatus = useMemo(() => {
    const agrupado = {}
    filtradosAtivos.forEach(item => {
      const status = item.status || 'Sem Status'
      agrupado[status] = (agrupado[status] || 0) + 1
    })
    return Object.entries(agrupado).map(([status, quantidade]) => ({ status, quantidade }))
  }, [filtradosAtivos])

  const handleExportarFiltrados = () => {
    if (abaAtiva === 'orcamentos') {
      exportarOrcamentos(orcamentosFiltrados)
    } else {
      exportarProjetos(projetosFiltrados)
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Geração e análise de relatórios segmentados"
        actions={relatorioGerado && (
          <button className="btn-primary flex items-center gap-2" onClick={handleExportarFiltrados}>
            <Download size={16} /> Exportar {abaAtiva === 'orcamentos' ? 'Orçamentos' : 'Projetos'}
          </button>
        )}
      />

      <div className="p-6 space-y-6">
        {/* Filtros */}
        <div className="card p-5">
          <h2 className="font-bold text-slate-700 mb-4 dark:text-slate-300">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Repartição', valores: opcoesUnicas.reparticao, selecionados: filtrosReparticao, setSelecionados: setFiltrosReparticao },
              { label: 'Status', valores: opcoesUnicas.status, selecionados: filtrosStatus, setSelecionados: setFiltrosStatus },
              { label: 'Edificação', valores: opcoesUnicas.edificacao, selecionados: filtrosEdificacao, setSelecionados: setFiltrosEdificacao },
              { label: 'Estado', valores: opcoesUnicas.estado, selecionados: filtrosEstado, setSelecionados: setFiltrosEstado },
              { label: 'Comercial', valores: opcoesUnicas.comercial, selecionados: filtrosComercial, setSelecionados: setFiltrosComercial },
              { label: 'Responsável', valores: opcoesUnicas.responsavel, selecionados: filtrosResponsavel, setSelecionados: setFiltrosResponsavel },
            ].map(({ label, valores, selecionados, setSelecionados }) => (
              <div key={label}>
                <label className="label">{label}</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-hover)' }}>
                  {valores.map(valor => (
                    <label key={valor} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={selecionados.includes(valor)}
                        onChange={() => setSelecionados(toggleFiltro(selecionados, valor))}
                        className="rounded"
                      />
                      {valor}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Período */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Data Início</label>
              <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Data Fim</label>
              <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="input" />
            </div>
          </div>

          <button
            onClick={() => setRelatorioGerado(true)}
            className="btn-primary w-full"
          >
            Gerar Relatório
          </button>
        </div>

        {/* Abas de Orçamentos e Projetos */}
        {relatorioGerado && (
          <>
            <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
              {['orcamentos', 'projetos'].map(aba => (
                <button
                  key={aba}
                  onClick={() => setAbaAtiva(aba)}
                  className={`px-4 py-2 font-semibold transition-colors ${
                    abaAtiva === aba
                      ? 'border-b-2'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  style={{
                    borderColor: abaAtiva === aba ? 'var(--accent)' : 'transparent',
                    color: abaAtiva === aba ? 'var(--accent)' : 'inherit'
                  }}
                >
                  {aba === 'orcamentos' ? '📊 Orçamentos' : '📋 Projetos'}
                </button>
              ))}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total', valor: kpiAtivo.total },
                { label: 'Valor Total', valor: `R$ ${(kpiAtivo.valor / 1000000).toFixed(2)}M` },
                { label: abaAtiva === 'orcamentos' ? 'Fechados' : 'Implantados', valor: abaAtiva === 'orcamentos' ? kpiAtivo.fechados : kpiAtivo.implantados },
                { label: 'Taxa', valor: `${kpiAtivo.taxa}%` },
              ].map(kpi => (
                <div key={kpi.label} className="card p-4 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{kpi.label}</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{kpi.valor}</p>
                </div>
              ))}
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-5">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">Por Repartição</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={graficoReparticao}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="reparticao" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: `1px solid var(--border)` }} />
                    <Bar dataKey="quantidade" fill="var(--accent)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">Distribuição por Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={graficoStatus} dataKey="quantidade" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                      {graficoStatus.map((_, idx) => <Cell key={`cell-${idx}`} fill={CORES[idx % CORES.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: `1px solid var(--border)` }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabela de Resultados */}
            <div className="card p-5">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">Resultados</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border)' }} className="border-b">
                      {abaAtiva === 'orcamentos' ? (
                        <>
                          <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                          <th className="px-4 py-3 text-left font-semibold">Projeto</th>
                          <th className="px-4 py-3 text-left font-semibold">Repartição</th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                          <th className="px-4 py-3 text-left font-semibold">Valor</th>
                          <th className="px-4 py-3 text-left font-semibold">Entrada</th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                          <th className="px-4 py-3 text-left font-semibold">Projeto</th>
                          <th className="px-4 py-3 text-left font-semibold">Repartição</th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                          <th className="px-4 py-3 text-left font-semibold">Valor</th>
                          <th className="px-4 py-3 text-left font-semibold">Implantação</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {filtradosAtivos.length === 0 ? (
                      <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-500">Nenhum registro encontrado</td></tr>
                    ) : (
                      filtradosAtivos.slice(0, 50).map(item => (
                        <tr key={item.id} style={{ borderColor: 'var(--border)' }} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-4 py-3">{item.cliente || '—'}</td>
                          <td className="px-4 py-3">{item.projeto || '—'}</td>
                          <td className="px-4 py-3">{item.reparticao || '—'}</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-semibold">{item.status || '—'}</span></td>
                          <td className="px-4 py-3 font-semibold">{Number(item.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td className="px-4 py-3 text-sm">
                            {(() => {
                              const data = abaAtiva === 'orcamentos' ? item.entradaFluig : (item.entradaControladoria || item.entradaCadastro)
                              if (!data) return '—'
                              try {
                                return format(new Date(data), 'dd/MM/yyyy')
                              } catch {
                                return '—'
                              }
                            })()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {filtradosAtivos.length > 50 && <p className="mt-2 text-sm text-slate-500">Mostrando 50 de {filtradosAtivos.length} registros</p>}
              </div>
            </div>
          </>
        )}

        {/* Exportar Base PowerBI */}
        <div className="card p-5">
          <h2 className="font-bold text-slate-700 mb-4 dark:text-slate-300">Exportar Base PowerBI</h2>
          <p className="text-sm text-slate-600 mb-4 dark:text-slate-400">
            Exporta uma planilha com abas ORÇAMENTOS e PROJETOS idêntica à estrutura CONTROLE DPTO - SECO - R06.xlsx para integração com Power BI
          </p>
          <button onClick={() => exportarBasePowerBI(dados.orcamentos, dados.projetos)} className="btn-primary flex items-center gap-2">
            <FileDown size={16} /> Exportar Base PowerBI
          </button>
        </div>
      </div>
    </div>
  )
}
