import { Lock } from 'lucide-react'

export default function AcessoNegado({ mensagem = 'Você não tem permissão para acessar este recurso.' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-b from-blue-50 to-slate-50 rounded-lg border border-blue-200">
      <Lock size={48} className="text-blue-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Acesso Negado</h3>
      <p className="text-sm text-slate-600 text-center max-w-sm">{mensagem}</p>
    </div>
  )
}
