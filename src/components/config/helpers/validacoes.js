/**
 * Validações para configurações
 */

export const validarRegra = (regra) => {
  const erros = []

  // Validar campos obrigatórios
  if (!regra.nomeColecao) erros.push('Coleção é obrigatória')
  if (!regra.descricao) erros.push('Descrição é obrigatória')

  // Validar condição
  if (!regra.condicao?.campo) {
    erros.push('Campo da condição é obrigatório')
  }
  if (!regra.condicao?.operador) {
    erros.push('Operador da condição é obrigatório')
  }
  if (!regra.condicao?.valor && regra.condicao?.valor !== 0) {
    erros.push('Valor da condição é obrigatório')
  }

  // Validar ações
  if (!regra.acoes || regra.acoes.length === 0) {
    erros.push('Pelo menos uma ação é obrigatória')
  }

  regra.acoes?.forEach((acao, idx) => {
    if (!acao.tipo) erros.push(`Ação ${idx + 1}: Tipo é obrigatório`)
    if (!acao.alvo) erros.push(`Ação ${idx + 1}: Campo alvo é obrigatório`)
  })

  return {
    valido: erros.length === 0,
    erros
  }
}

export const validarCampo = (campo, valor, regrasValidacao = {}) => {
  const erros = []

  // Validar campo obrigatório
  if (regrasValidacao.obrigatorio && (!valor && valor !== 0 && valor !== false)) {
    return {
      valido: false,
      mensagem: `${campo} é obrigatório`
    }
  }

  // Pular validações se vazio e não obrigatório
  if (!valor && valor !== 0 && valor !== false) {
    return { valido: true }
  }

  // Validar min
  if (regrasValidacao.min !== null && regrasValidacao.min !== undefined) {
    if (typeof valor === 'string' && valor.length < regrasValidacao.min) {
      return {
        valido: false,
        mensagem: regrasValidacao.mensagem || `Mínimo de ${regrasValidacao.min} caracteres`
      }
    }
    if (typeof valor === 'number' && valor < regrasValidacao.min) {
      return {
        valido: false,
        mensagem: regrasValidacao.mensagem || `Valor mínimo: ${regrasValidacao.min}`
      }
    }
  }

  // Validar max
  if (regrasValidacao.max !== null && regrasValidacao.max !== undefined) {
    if (typeof valor === 'string' && valor.length > regrasValidacao.max) {
      return {
        valido: false,
        mensagem: regrasValidacao.mensagem || `Máximo de ${regrasValidacao.max} caracteres`
      }
    }
    if (typeof valor === 'number' && valor > regrasValidacao.max) {
      return {
        valido: false,
        mensagem: regrasValidacao.mensagem || `Valor máximo: ${regrasValidacao.max}`
      }
    }
  }

  // Validar regex
  if (regrasValidacao.regex) {
    try {
      const regex = new RegExp(regrasValidacao.regex)
      if (!regex.test(String(valor))) {
        return {
          valido: false,
          mensagem: regrasValidacao.mensagem || `Formato inválido: ${regrasValidacao.regex}`
        }
      }
    } catch (err) {
      console.warn('Regex inválido:', regrasValidacao.regex, err)
    }
  }

  return { valido: true }
}

export const validarCamposDinamicos = (campo) => {
  const erros = []

  if (!campo.nomeColecao) erros.push('Coleção é obrigatória')
  if (!campo.nomeCampo) erros.push('Nome do campo é obrigatório')
  if (!campo.tipo) erros.push('Tipo é obrigatório')
  if (!campo.label) erros.push('Label é obrigatório')

  // Validar se tipo=select precisa de opções
  if (campo.tipo === 'select' && (!campo.opcoes || campo.opcoes.length === 0)) {
    erros.push('Selecione deve ter pelo menos uma opção')
  }

  return {
    valido: erros.length === 0,
    erros
  }
}

export const validarAutomacao = (automacao) => {
  const erros = []

  if (!automacao.nome) erros.push('Nome é obrigatório')
  if (!automacao.trigger?.tipo) erros.push('Tipo de trigger é obrigatório')
  if (!automacao.acoes || automacao.acoes.length === 0) {
    erros.push('Pelo menos uma ação é obrigatória')
  }

  return {
    valido: erros.length === 0,
    erros
  }
}
