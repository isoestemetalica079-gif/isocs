import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute({ children, perfisPermitidos }) {
  const { user, perfil, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Carregando...</span>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (perfisPermitidos && perfil && !perfisPermitidos.includes(perfil.perfil)) {
    return <Navigate to="/" replace />
  }

  return children
}
