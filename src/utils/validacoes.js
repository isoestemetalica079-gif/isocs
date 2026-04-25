/**
 * Framework Centralizado de Validações
 * Todas as regras de validação do sistema ISOCS
 */

// ============================================
// 1. VALIDAÇÕES DE SELECT (Obrigatório)
// ============================================

export const validarSelect = (valor, nomeCampo) => {
  if (!valor || valor === '') {
    return {
      valido: false,
      erro: `${nomeCampo} é obrigatório. Selecione uma opção para continuar.`
    }
  }
  return { valido: true }
}

// ============================================
// 2. VALIDAÇÕES DE FORMATO (FLUIG, MF)
// ============================================

export const validarFluig = (valor) => {
  if (!valor && valor !== 0) {
    return { valido: true } // Campo opcional
  }

  const limpo = String(valor).trim()
  const regex = /^\d{6}$/

  if (!regex.test(limpo)) {
    return {
      valido: false,
      erro: 'FLUIG deve conter exatamente 6 números (ex: 168901)'
    }
  }
  return { valido: true }
}

export const validarMF = (valor) => {
  if (!valor && valor !== 0) {
    return { valido: true } // Campo opcional
  }

  const limpo = String(valor).trim()
  const regex = /^\d{5}$/

  if (!regex.test(limpo)) {
    return {
      valido: false,
      erro: 'MF deve conter exatamente 5 números (ex: 12340)'
    }
  }
  return { valido: true }
}

// ============================================
// 3. VALIDAÇÃO DE TAG
// ============================================

export const validarTag = (valor) => {
  const opcoes = ['ISM', 'DRYFAST']

  if (!valor || valor === '') {
    return { valido: true } // Campo opcional
  }

  const limpo = String(valor).trim().toUpperCase()

  if (!opcoes.includes(limpo)) {
    return {
      valido: false,
      erro: `TAG deve ser ${opcoes.join(' ou ')} (você digitou: "${valor}")`
    }
  }
  return { valido: true }
}

// ============================================
// 4. VALIDAÇÃO DE INPUT NUMÉRICO
// ============================================

/**
 * Processa entrada de número (converte vírgula para ponto)
 * @param {string|number} valor - Valor bruto do input
 * @returns {number|string} - Número válido ou string vazia
 */
export const processarNumero = (valor) => {
  if (!valor && valor !== 0) return ''

  const limpo = String(valor).replace(/[^0-9.,]/g, '')
  const convertido = limpo.replace(',', '.')

  if (isNaN(convertido) || convertido === '') {
    return ''
  }

  return parseFloat(convertido)
}

/**
 * Formata número para exibição em moeda
 */
export const formatarMoeda = (valor) => {
  if (!valor && valor !== 0) return 'R$ 0,00'

  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

// ============================================
// 5. MERGE SEGURO (Para carregar dados)
// ============================================

/**
 * Faz merge seguro de dados, sem sobrescrever com undefined
 * @param {object} initial - Valores iniciais/padrão
 * @param {object} dados - Dados a serem mesclados
 * @returns {object} - Dados mesclados com segurança
 */
export const mergeSeguro = (initial = {}, dados = {}) => {
  // Validar se são objetos válidos
  if (!dados || typeof dados !== 'object') {
    return initial
  }

  // Merge: valores do dados, mas mantém padrões se undefined
  const resultado = { ...initial }

  Object.keys(dados).forEach(chave => {
    const valor = dados[chave]
    // Só sobrescreve se o valor não é undefined ou null
    if (valor !== undefined && valor !== null) {
      resultado[chave] = valor
    }
  })

  return resultado
}

// ============================================
// 6. VALIDAÇÃO DE CIDADES BRASILEIRAS
// ============================================

// Será importado de validacaoCidades.js
export const sugerirCidades = async (texto) => {
  // Implementado separadamente
  return []
}

// ============================================
// 7. VALIDAÇÕES COMBINADAS
// ============================================

/**
 * Valida todos os campos de um formulário
 * @param {object} form - Objeto do formulário
 * @param {array} regras - Array de regras de validação
 * @returns {object} - { valido: boolean, erros: {} }
 */
export const validarFormulario = (form, regras) => {
  const erros = {}
  let valido = true

  regras.forEach(regra => {
    const { campo, tipo, validador, nomeCampo } = regra
    const valor = form[campo]

    let resultado

    switch (tipo) {
      case 'select':
        resultado = validarSelect(valor, nomeCampo || campo)
        break
      case 'fluig':
        resultado = validarFluig(valor)
        break
      case 'mf':
        resultado = validarMF(valor)
        break
      case 'tag':
        resultado = validarTag(valor)
        break
      case 'customizado':
        resultado = validador ? validador(valor) : { valido: true }
        break
      default:
        resultado = { valido: true }
    }

    if (!resultado.valido) {
      erros[campo] = resultado.erro
      valido = false
    }
  })

  return { valido, erros }
}

/**
 * Obtém primeira mensagem de erro (para exibir em toast)
 */
export const getPrimeiroErro = (erros) => {
  const chaves = Object.keys(erros)
  if (chaves.length === 0) return null
  return erros[chaves[0]]
}

// ============================================
// 8. SANITIZAÇÃO
// ============================================

/**
 * Remove espaços extras e normaliza strings
 */
export const sanitizar = (texto) => {
  if (!texto) return ''
  return String(texto).trim().replace(/\s+/g, ' ')
}
