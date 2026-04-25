import { useAuth } from '../contexts/AuthContext'

// Definição de permissões por perfil
const PERMISSOES = {
  gestor: {
    podeEditar: true,
    podeExcluir: true,
    podeAcessarAdmin: true,
    podeAcessarConfiguracao: true,
    podeAcessarOrcamentos: true,
    podeAcessarProjetos: true,
    podeAcessarART: true,
    podeAcessarRelatorios: true,
    isGestor: true,
  },
  tecnico: {
    podeEditar: true,
    podeExcluir: false,
    podeAcessarAdmin: false,
    podeAcessarConfiguracao: false,
    podeAcessarOrcamentos: true,
    podeAcessarProjetos: true,
    podeAcessarART: true,
    podeAcessarRelatorios: true,
    isTecnico: true,
  },
  comercial: {
    podeEditar: false,
    podeExcluir: false,
    podeAcessarAdmin: false,
    podeAcessarConfiguracao: false,
    podeAcessarOrcamentos: true,
    podeAcessarProjetos: false,
    podeAcessarART: false,
    podeAcessarRelatorios: false,
    isComercial: true,
  },
  controladoria: {
    podeEditar: false,
    podeExcluir: false,
    podeAcessarAdmin: false,
    podeAcessarConfiguracao: false,
    podeAcessarOrcamentos: true,
    podeAcessarProjetos: true,
    podeAcessarART: false,
    podeAcessarRelatorios: true,
    isControladoria: true,
  }
}

export function usePermissoes() {
  const { perfil } = useAuth()
  const perfilAtual = perfil?.perfil || 'comercial'
  const permissoes = PERMISSOES[perfilAtual] || PERMISSOES.comercial

  return {
    ...permissoes,
    perfil: perfilAtual,
    podeExibir: (tipoPermissao) => permissoes[tipoPermissao] || false
  }
}
