const MAP = {
  'PENDENTE':             'bg-yellow-100 text-yellow-800',
  'EM ANÁLISE':          'bg-orange-100 text-orange-800',
  'APROVAÇÃO CLIENTE':   'bg-blue-100 text-blue-800',
  'APROVADO':            'bg-indigo-100 text-indigo-800',
  'FINALIZADO':          'bg-green-100 text-green-800',
  'CANCELADO':           'bg-red-100 text-red-800',
  'NÃO FECHADO':         'bg-slate-100 text-slate-600',
  'COMPATIBILIZAÇÃO':    'bg-purple-100 text-purple-800',
  'CADASTRO':            'bg-cyan-100 text-cyan-800',
  'CONTROLADORIA':       'bg-teal-100 text-teal-800',
  'IMPLANTAÇÃO':         'bg-emerald-100 text-emerald-800',
  'EMITIDA':             'bg-green-100 text-green-800',
  'APROVAÇÃO RASCUNHO':  'bg-blue-100 text-blue-800',
  'AGENDADO FINANCEIRO': 'bg-orange-100 text-orange-800',
}

export default function StatusBadge({ status }) {
  const cls = MAP[status] || 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status || '—'}
    </span>
  )
}
