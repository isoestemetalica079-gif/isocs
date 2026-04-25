import { useState } from 'react'
import { Settings, Database, AlertCircle, Lock, BarChart3, MessageSquare, Zap, LogsIcon } from 'lucide-react'
import CamposDinamicosTab from './CamposDinamicosTab'
import RegrasTabelaTab from './RegrasTabelaTab'
import PermissoesTab from './PermissoesTab'
import KpisTab from './KpisTab'
import MensagensTab from './MensagensTab'
import AutomacoesTab from './AutomacoesTab'
import AuditoriaTab from './AuditoriaTab'

const TABS = [
  { id: 'campos', label: 'Campos Dinâmicos', icon: Database },
  { id: 'regras', label: 'Regras Condicionais', icon: AlertCircle },
  { id: 'permissoes', label: 'Permissões', icon: Lock },
  { id: 'kpis', label: 'KPIs', icon: BarChart3 },
  { id: 'mensagens', label: 'Mensagens Globais', icon: MessageSquare },
  { id: 'automacoes', label: 'Automações', icon: Zap },
  { id: 'auditoria', label: 'Auditoria', icon: LogsIcon },
]

export default function ConfigLayout() {
  const [activeTab, setActiveTab] = useState('campos')

  const renderTab = () => {
    switch (activeTab) {
      case 'campos':
        return <CamposDinamicosTab />
      case 'regras':
        return <RegrasTabelaTab />
      case 'permissoes':
        return <PermissoesTab />
      case 'kpis':
        return <KpisTab />
      case 'mensagens':
        return <MensagensTab />
      case 'automacoes':
        return <AutomacoesTab />
      case 'auditoria':
        return <AuditoriaTab />
      default:
        return <CamposDinamicosTab />
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={24} className="text-blue-700 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configurações</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sistema — Gestão Administrativa</p>
        </div>

        <nav className="p-4 space-y-2">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Gerencie as configurações do sistema ISOCS
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
            {renderTab()}
          </div>
        </div>
      </main>
    </div>
  )
}
