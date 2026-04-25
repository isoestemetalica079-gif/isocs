import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orcamentos from './pages/Orcamentos'
import Projetos from './pages/Projetos'
import Relatorios from './pages/Relatorios'
import ART from './pages/ART'
import Admin from './pages/Admin'
import Perfil from './pages/Perfil'
import ConfiguracoesPage from './pages/ConfiguracoesPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="orcamentos" element={<Orcamentos />} />
            <Route path="projetos" element={<Projetos />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="ferramentas/*" element={<div className="p-6">Em construção...</div>} />
            <Route path="art" element={<ART />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="admin" element={
              <PrivateRoute perfisPermitidos={['gestor']}>
                <Admin />
              </PrivateRoute>
            } />
            <Route path="configuracao" element={
              <PrivateRoute perfisPermitidos={['gestor']}>
                <ConfiguracoesPage />
              </PrivateRoute>
            } />
            <Route path="executivo" element={
              <PrivateRoute perfisPermitidos={['gestor', 'tecnico']}>
                <div className="p-6">Executivo (Em construção)</div>
              </PrivateRoute>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
