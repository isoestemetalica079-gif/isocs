/**
 * Motor de regras condicionais para ISOCS
 * Avalia condições e aplica ações automáticas
 */

/**
 * Avalia uma condição simples
 * @param {Object} condicao - { campo, operador, valor }
 * @param {Object} dados - dados do formulário
 * @returns {boolean}
 */
export const avaliarCondicao = (condicao, dados) => {
  const valor = dados[condicao.campo]
  const esperado = condicao.valor

  switch (condicao.operador) {
    case '==':
      return valor == esperado
    case '!=':
      return valor != esperado
    case '>':
      return Number(valor) > Number(esperado)
    case '<':
      return Number(valor) < Number(esperado)
    case '>=':
      return Number(valor) >= Number(esperado)
    case '<=':
      return Number(valor) <= Number(esperado)
    case 'contains':
      return String(valor).includes(String(esperado))
    case 'startsWith':
      return String(valor).startsWith(String(esperado))
    case 'endsWith':
      return String(valor).endsWith(String(esperado))
    case 'in':
      const opcoes = Array.isArray(esperado) ? esperado : String(esperado).split(',').map(v => v.trim())
      return opcoes.includes(String(valor))
    default:
      return false
  }
}

/**
 * Executa uma ação específica
 * @param {Object} acao - { tipo, alvo, parametros }
 * @param {Object} dados - dados do formulário
 * @param {Object} erros - objeto para acumular erros de validação
 * @param {Object} camposOcultos - objeto para rastrear campos ocultos
 * @returns {Object} dados atualizados
 */
export const executarAcao = (acao, dados, erros = {}, camposOcultos = {}) => {
  const resultado = { dados, erros, camposOcultos }

  switch (acao.tipo) {
    case 'validar':
      // Marcar campo como requerindo validação
      if (!resultado.erros[acao.alvo]) {
        resultado.erros[acao.alvo] = acao.parametros?.mensagem || 'Campo inválido'
      }
      break

    case 'ocultar':
      resultado.camposOcultos[acao.alvo] = true
      break

    case 'mostrar':
      resultado.camposOcultos[acao.alvo] = false
      break

    case 'alert':
      // Alert será tratado no componente da UI
      console.warn('Alert:', acao.parametros?.mensagem)
      break

    case 'calcular_automatico':
      // Calcular valor baseado em fórmula
      if (acao.parametros?.formula) {
        try {
          const funcao = new Function('dados', `return ${acao.parametros.formula}`)
          resultado.dados[acao.alvo] = funcao(resultado.dados)
        } catch (err) {
          console.error('Erro ao calcular:', err)
        }
      }
      break

    case 'autocomplete':
      // Autocomplete será tratado no componente da UI
      break

    default:
      break
  }

  return resultado
}

/**
 * Aplica todas as regras ativas a um formulário
 * @param {string} nomeColecao - nome da coleção
 * @param {Object} dados - dados do formulário
 * @param {Array} regras - array de regras condicionais
 * @returns {Object} { dados atualizados, erros, camposOcultos, avisos }
 */
export const aplicarRegras = (nomeColecao, dados, regras = []) => {
  const regrasFiltradas = regras.filter(r => r.nomeColecao === nomeColecao && r.ativo)

  // Ordenar por ordem
  regrasFiltradas.sort((a, b) => (a.ordem || 0) - (b.ordem || 0))

  let resultado = {
    dados: { ...dados },
    erros: {},
    camposOcultos: {},
    avisos: []
  }

  for (const regra of regrasFiltradas) {
    // Avaliar condição
    if (avaliarCondicao(regra.condicao, resultado.dados)) {
      // Executar ações
      for (const acao of regra.acoes || []) {
        const novoResultado = executarAcao(acao, resultado.dados, resultado.erros, resultado.camposOcultos)
        resultado.dados = novoResultado.dados
        resultado.erros = novoResultado.erros
        resultado.camposOcultos = novoResultado.camposOcultos

        // Adicionar avisos de alert
        if (acao.tipo === 'alert') {
          resultado.avisos.push({
            tipo: acao.parametros?.tipo || 'info',
            mensagem: acao.parametros?.mensagem || ''
          })
        }
      }
    }
  }

  return resultado
}

/**
 * Valida um campo contra as regras de validação do campo dinâmico
 * @param {Object} campo - definição do campo dinâmico
 * @param {*} valor - valor a validar
 * @returns {Object} { valido: boolean, mensagem: string }
 */
export const validarCamposDinamico = (campo, valor) => {
  const validacoes = campo.validacoes || {}

  // Verificar obrigatório
  if (campo.obrigatorio && (!valor && valor !== 0 && valor !== false)) {
    return {
      valido: false,
      mensagem: `${campo.label} é obrigatório`
    }
  }

  // Pular se vazio e não obrigatório
  if (!valor && valor !== 0 && valor !== false) {
    return { valido: true }
  }

  // Validar min
  if (validacoes.min !== null && validacoes.min !== undefined) {
    if (typeof valor === 'string' && valor.length < validacoes.min) {
      return {
        valido: false,
        mensagem: validacoes.mensagem || `${campo.label}: mínimo ${validacoes.min} caracteres`
      }
    }
    if (typeof valor === 'number' && valor < validacoes.min) {
      return {
        valido: false,
        mensagem: validacoes.mensagem || `${campo.label}: valor mínimo ${validacoes.min}`
      }
    }
  }

  // Validar max
  if (validacoes.max !== null && validacoes.max !== undefined) {
    if (typeof valor === 'string' && valor.length > validacoes.max) {
      return {
        valido: false,
        mensagem: validacoes.mensagem || `${campo.label}: máximo ${validacoes.max} caracteres`
      }
    }
    if (typeof valor === 'number' && valor > validacoes.max) {
      return {
        valido: false,
        mensagem: validacoes.mensagem || `${campo.label}: valor máximo ${validacoes.max}`
      }
    }
  }

  // Validar regex
  if (validacoes.regex) {
    try {
      const regex = new RegExp(validacoes.regex)
      if (!regex.test(String(valor))) {
        return {
          valido: false,
          mensagem: validacoes.mensagem || `${campo.label}: formato inválido`
        }
      }
    } catch (err) {
      console.warn('Regex inválido:', validacoes.regex)
    }
  }

  return { valido: true }
}

/**
 * Filtra campos para mostrar/ocultar baseado em permissões
 * @param {Array} campos - array de campos dinâmicos
 * @param {Object} camposOcultos - objeto com campos a ocultar
 * @param {string} perfil - perfil do usuário
 * @param {Array} permissoes - array de permissoes_campos
 * @returns {Array} campos filtrados
 */
export const filtrarCamposPorPermissao = (campos, camposOcultos, perfil, permissoes = []) => {
  return campos.filter(campo => {
    // Verificar se está oculto por regra
    if (camposOcultos[campo.id]) return false

    // Verificar se está ativo
    if (!campo.ativo) return false

    // Verificar permissão por perfil
    const permissao = permissoes.find(p =>
      p.nomeCampo === campo.nomeCampo &&
      p.perfil === perfil
    )

    if (permissao && !permissao.podeVisualizacao) return false

    return true
  })
}
