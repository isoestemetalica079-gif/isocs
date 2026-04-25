import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, FileText, FolderKanban, Calculator,
  Ruler, Award, Users, LogOut, Menu, X, ChevronRight, Moon, Sun, BarChart3,
  Wrench, ChevronDown, User, Settings
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/orcamentos', label: 'Orçamentos', icon: FileText },
  { to: '/projetos', label: 'Executivo', icon: FolderKanban },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { to: '/art', label: 'ART', icon: Award },
]

const adminItems = [
  { to: '/admin', label: 'Usuários', icon: Users },
  { to: '/configuracao', label: 'Configurações do Sistema', icon: Settings },
]

const ferramentasItems = [
  {
    label: 'Orçamento Estimado',
    submenu: [
      { to: '/ferramentas/orcamento-isotelhado', label: 'ISOTELHADO' },
      { to: '/ferramentas/orcamento-nexframe', label: 'NEXFRAME' },
      { to: '/ferramentas/orcamento-isodry', label: 'ISODRY' },
      { to: '/ferramentas/orcamento-dryfast', label: 'DRYFAST' },
    ]
  },
  {
    label: 'Gerador',
    submenu: [
      { to: '/ferramentas/gerador-isotelhado', label: 'ISOTELHADO' },
      { to: '/ferramentas/gerador-nexframe', label: 'NEXFRAME' },
      { to: '/ferramentas/gerador-isodry', label: 'ISODRY' },
      { to: '/ferramentas/gerador-dryfast', label: 'DRYFAST' },
    ]
  }
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ferramentasOpen, setFerramentasOpen] = useState(false)
  const [ferramentasSubOpen, setFerramentasSubOpen] = useState({})
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved !== null ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const { user, perfil, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = (perfil?.nome || user?.email || 'U')
    .split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ backgroundColor: '#1a2332', borderRightColor: 'rgba(255,255,255,0.1)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottomColor: 'rgba(255,255,255,0.1)', borderBottomWidth: '1px' }}>
          <img src="/assets/isocs-logo.svg" alt="ISOCS" style={{ width: '100%', maxWidth: '200px', borderRadius: '8px', display: 'block' }} />
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2 text-gray-400">Menu</p>
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? 'white' : '#a0aec0'
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className="flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} />}
                </>
              )}
            </NavLink>
          ))}

          {/* Ferramentas */}
          <div>
            <button
              onClick={() => setFerramentasOpen(!ferramentasOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group"
              style={{ color: '#a0aec0', backgroundColor: 'transparent' }}
            >
              <Wrench size={17} className="flex-shrink-0" />
              <span className="flex-1 text-left">Ferramentas</span>
              <ChevronDown size={14} style={{ transform: ferramentasOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }} />
            </button>
            {ferramentasOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-gray-600 pl-2">
                {ferramentasItems.map((item, idx) => (
                  <div key={idx}>
                    {item.submenu ? (
                      <>
                        <button
                          onClick={() => setFerramentasSubOpen(prev => ({ ...prev, [idx]: !prev[idx] }))}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150"
                          style={{ color: '#a0aec0', backgroundColor: 'transparent' }}
                        >
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronDown size={12} style={{ transform: ferramentasSubOpen[idx] ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }} />
                        </button>
                        {ferramentasSubOpen[idx] && (
                          <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-2">
                            {item.submenu.map(({ to, label }) => (
                              <NavLink
                                key={to} to={to} onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150`}
                                style={({ isActive }) => ({
                                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                                  color: isActive ? 'white' : '#a0aec0'
                                })}
                              >
                                <span>{label}</span>
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <NavLink
                        to={item.to} onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150`}
                        style={({ isActive }) => ({
                          backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                          color: isActive ? 'white' : '#a0aec0'
                        })}
                      >
                        <span>{item.label}</span>
                      </NavLink>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {perfil?.perfil === 'gestor' && (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mt-5 mb-2 text-gray-400">Administração</p>
              {adminItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to} to={to} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150`}
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? 'white' : '#a0aec0'
                  })}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 pt-3" style={{ borderTopColor: 'rgba(255,255,255,0.1)', borderTopWidth: '1px' }}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{perfil?.nome || 'Usuário'}</p>
              <p className="text-xs capitalize truncate text-gray-400">{perfil?.perfil || ''}</p>
            </div>
            <NavLink to="/perfil" title="Perfil" className="transition-colors text-gray-400 hover:text-gray-300">
              <User size={16} />
            </NavLink>
            <button onClick={handleLogout} title="Sair" className="transition-colors text-gray-400 hover:text-gray-300">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderBottomColor: 'var(--border)', borderBottomWidth: '1px' }}>
          {/* Logo e breadcrumb (desktop only) */}
          <div className="hidden lg:flex items-center gap-3 text-sm">
            <span style={{ color: 'var(--text-muted)' }}>ISOCS</span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ color: 'var(--text-primary)' }}>Dashboard</span>
          </div>

          {/* Mobile menu button */}
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text-secondary)' }}>
            <Menu size={22} />
          </button>

          {/* Icons (right side) */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle"
              title={darkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              aria-label={darkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              <span className="knob">
                {darkMode ? <Sun size={12} /> : <Moon size={12} />}
              </span>
            </button>
            <button className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-hover)' }} title="Notificações">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ top: '8px', right: '8px' }}></span>
            </button>
            <button className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-hover)' }} title="Configurações">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
