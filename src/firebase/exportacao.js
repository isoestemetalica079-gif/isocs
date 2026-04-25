import * as XLSX from 'xlsx'

// Mapeamento exato: ordem de colunas na planilha original
const COLUNAS_ORCAMENTOS = [
  'STATUS', 'FLUIG', 'MÊS', 'TAG', 'REPARTIÇÃO', 'TIPOLOGIA', 'EDIFICAÇÃO', 'ÁGUAS',
  'ESCOPO', 'CLIENTE', 'PROJETO', 'COMERCIAL', 'CIDADE', 'ESTADO', 'ÁREA', 'PESO',
  'MF', 'SANTRI', 'METODOLOGIA', 'R$ REVEST.', 'R$ ESTRUTURA', 'R$ M.O.', 'VALOR TOTAL',
  'ENTRADA FLUIG', 'SAÍDA CONTROLADORIA', 'RESPONSÁVEL', 'FECHADO?', 'MÊS FECHAMENTO', 'R$ FECHADO'
]

const COLUNAS_PROJETOS = [
  'STATUS', 'MF', 'FLUIG', 'MÊS', 'TAG', 'REPARTIÇÃO', 'TIPOLOGIA', 'EDIFICAÇÃO', 'ÁGUAS',
  'ESCOPO', 'CLIENTE', 'PROJETO', 'COMERCIAL', 'CIDADE', 'ESTADO', 'ÁREA',
  'PREVISÃO IMPORTAÇÃO', 'PROPOSTA APROVADA', 'ENTRADA APROV. CLIENTE', 'SAÍDA APROV. CLIENTE',
  'ENTRADA COMPATIBILIZAÇÃO', 'SAÍDA COMPATIBILIZAÇÃO', 'ENTRADA CADASTRO',
  'ENTRADA CONTROLADORIA', 'SAÍDA CONTROLADORIA', 'SAÍDA CADASTRO',
  'ENTRADA IMPLANTAÇÃO', 'SAÍDA IMPLANTAÇÃO', 'Nº MF IMPLANTADA', 'PESO',
  'ORÇADO', 'IMPORTAÇÃO', 'R$ TOTAL'
]

const COLUNAS_ARQUITETURA = [
  'ID', 'MF', 'FLUIG', 'TIPOLOGIA', 'MÉTODO', 'TÉCNICO', 'CLIENTE', 'PROJETO',
  'COMERCIAL', 'CIDADE', 'ESTADO', 'MÃO DE OBRA', 'ÁREA', 'ESCOPO', 'R$ TOTAL',
  'R$ MATERIAL', 'R$ M.O.', 'R$ FECHADO', 'DESCONTO', 'KG AÇO', 'ÍNDICE',
  'ENTRADA', 'SAÍDA', 'SLA', 'LEAD', 'MÊS'
]

const COLUNAS_ART = [
  'STATUS', 'FLUIG', 'OBRA', 'MÊS', 'MODALIDADE', 'REPARTIÇÃO', 'TIPOLOGIA',
  'EDIFICAÇÃO', 'ÁGUAS', 'ESCOPO', 'CLIENTE', 'COMERCIAL', 'CIDADE', 'ESTADO',
  'ÁREA', 'PESO', 'MF', 'Nº ART', 'VALOR MAT', 'VALOR M.O.', 'VALOR TOTAL',
  'ENTRADA', 'SAÍDA', 'RESPONSÁVEL TÉCNICO', 'FECHADO?'
]

// Mapear campos Firestore para colunas da planilha
const MAPA_ORCAMENTOS = {
  'STATUS': 'status',
  'FLUIG': 'fluig',
  'MÊS': 'mes',
  'TAG': 'tag',
  'REPARTIÇÃO': 'reparticao',
  'TIPOLOGIA': 'tipologia',
  'EDIFICAÇÃO': 'edificacao',
  'ÁGUAS': 'aguas',
  'ESCOPO': 'escopo',
  'CLIENTE': 'cliente',
  'PROJETO': 'projeto',
  'COMERCIAL': 'comercial',
  'CIDADE': 'cidade',
  'ESTADO': 'estado',
  'ÁREA': 'area',
  'PESO': 'peso',
  'MF': 'mf',
  'SANTRI': 'santri',
  'METODOLOGIA': 'metodologia',
  'R$ REVEST.': 'valorRevestimento',
  'R$ ESTRUTURA': 'valorEstrutura',
  'R$ M.O.': 'valorMO',
  'VALOR TOTAL': 'valorTotal',
  'ENTRADA FLUIG': 'entradaFluig',
  'SAÍDA CONTROLADORIA': 'saidaControladoria',
  'RESPONSÁVEL': 'responsavel',
  'FECHADO?': 'fechado',
  'MÊS FECHAMENTO': 'mesFechamento',
  'R$ FECHADO': 'valorFechado'
}

const MAPA_PROJETOS = {
  'STATUS': 'status',
  'MF': 'mf',
  'FLUIG': 'fluig',
  'MÊS': 'mes',
  'TAG': 'tag',
  'REPARTIÇÃO': 'reparticao',
  'TIPOLOGIA': 'tipologia',
  'EDIFICAÇÃO': 'edificacao',
  'ÁGUAS': 'aguas',
  'ESCOPO': 'escopo',
  'CLIENTE': 'cliente',
  'PROJETO': 'projeto',
  'COMERCIAL': 'comercial',
  'CIDADE': 'cidade',
  'ESTADO': 'estado',
  'ÁREA': 'area',
  'PREVISÃO IMPORTAÇÃO': 'previsaoImportacao',
  'PROPOSTA APROVADA': 'entradaPropostaCliente',
  'ENTRADA APROV. CLIENTE': 'entradaAprovCliente',
  'SAÍDA APROV. CLIENTE': 'saidaAprovCliente',
  'ENTRADA COMPATIBILIZAÇÃO': 'entradaCompatibilizacao',
  'SAÍDA COMPATIBILIZAÇÃO': 'saidaCompatibilizacao',
  'ENTRADA CADASTRO': 'entradaCadastro',
  'ENTRADA CONTROLADORIA': 'entradaControladoria',
  'SAÍDA CONTROLADORIA': 'saidaControladoria',
  'SAÍDA CADASTRO': 'saidaCadastro',
  'ENTRADA IMPLANTAÇÃO': 'entradaImplantacao',
  'SAÍDA IMPLANTAÇÃO': 'saidaImplantacao',
  'Nº MF IMPLANTADA': 'nrMfImplantada',
  'PESO': 'peso',
  'ORÇADO': 'orcado',
  'IMPORTAÇÃO': 'importacao',
  'R$ TOTAL': 'valorTotal'
}

const MAPA_ARQUITETURA = {
  'ID': 'id',
  'MF': 'mf',
  'FLUIG': 'fluig',
  'TIPOLOGIA': 'tipologia',
  'MÉTODO': 'metodo',
  'TÉCNICO': 'tecnico',
  'CLIENTE': 'cliente',
  'PROJETO': 'projeto',
  'COMERCIAL': 'comercial',
  'CIDADE': 'cidade',
  'ESTADO': 'estado',
  'MÃO DE OBRA': 'maoDeObra',
  'ÁREA': 'area',
  'ESCOPO': 'escopo',
  'R$ TOTAL': 'valorTotal',
  'R$ MATERIAL': 'valorMaterial',
  'R$ M.O.': 'valorMO',
  'R$ FECHADO': 'valorFechado',
  'DESCONTO': 'desconto',
  'KG AÇO': 'kgAco',
  'ÍNDICE': 'indice',
  'ENTRADA': 'entrada',
  'SAÍDA': 'saida',
  'SLA': 'sla',
  'LEAD': 'lead',
  'MÊS': 'mes'
}

const MAPA_ART = {
  'STATUS': 'status',
  'FLUIG': 'fluig',
  'OBRA': 'obra',
  'MÊS': 'mes',
  'MODALIDADE': 'modalidade',
  'REPARTIÇÃO': 'reparticao',
  'TIPOLOGIA': 'tipologia',
  'EDIFICAÇÃO': 'edificacao',
  'ÁGUAS': 'aguas',
  'ESCOPO': 'escopo',
  'CLIENTE': 'cliente',
  'COMERCIAL': 'comercial',
  'CIDADE': 'cidade',
  'ESTADO': 'estado',
  'ÁREA': 'area',
  'PESO': 'peso',
  'MF': 'mf',
  'Nº ART': 'nrArt',
  'VALOR MAT': 'valorMaterial',
  'VALOR M.O.': 'valorMO',
  'VALOR TOTAL': 'valorTotal',
  'ENTRADA': 'entrada',
  'SAÍDA': 'saida',
  'RESPONSÁVEL TÉCNICO': 'responsavelTecnico',
  'FECHADO?': 'fechado'
}

function converterDados(dados, mapa, colunas) {
  return dados.map(item => {
    const linha = {}
    colunas.forEach(col => {
      const campo = mapa[col]
      linha[col] = item[campo] ?? ''
    })
    return linha
  })
}

export function exportarOrcamentos(dados) {
  const linhas = converterDados(dados, MAPA_ORCAMENTOS, COLUNAS_ORCAMENTOS)
  const ws = XLSX.utils.json_to_sheet(linhas, { header: COLUNAS_ORCAMENTOS })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'ORÇAMENTOS')
  XLSX.writeFile(wb, `ISOCS-Orcamentos-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportarProjetos(dados) {
  const linhas = converterDados(dados, MAPA_PROJETOS, COLUNAS_PROJETOS)
  const ws = XLSX.utils.json_to_sheet(linhas, { header: COLUNAS_PROJETOS })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'PROJETOS')
  XLSX.writeFile(wb, `ISOCS-Projetos-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportarArquitetura(dados) {
  const linhas = converterDados(dados, MAPA_ARQUITETURA, COLUNAS_ARQUITETURA)
  const ws = XLSX.utils.json_to_sheet(linhas, { header: COLUNAS_ARQUITETURA })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'ARQUITETURA')
  XLSX.writeFile(wb, `ISOCS-Arquitetura-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportarART(dados) {
  const linhas = converterDados(dados, MAPA_ART, COLUNAS_ART)
  const ws = XLSX.utils.json_to_sheet(linhas, { header: COLUNAS_ART })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'ART')
  XLSX.writeFile(wb, `ISOCS-ART-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportarBasePowerBI(orcamentos, projetos) {
  const linhasOrc = converterDados(orcamentos, MAPA_ORCAMENTOS, COLUNAS_ORCAMENTOS)
  const linhasProj = converterDados(projetos, MAPA_PROJETOS, COLUNAS_PROJETOS)

  const wsOrc = XLSX.utils.json_to_sheet(linhasOrc, { header: COLUNAS_ORCAMENTOS })
  const wsProj = XLSX.utils.json_to_sheet(linhasProj, { header: COLUNAS_PROJETOS })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsOrc, 'ORÇAMENTOS')
  XLSX.utils.book_append_sheet(wb, wsProj, 'PROJETOS')

  XLSX.writeFile(wb, `ISOCS-Base-PowerBI-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportarRelatorios(orcamentos, projetos, tipo = 'todos', formato = 'excel') {
  if (tipo === 'todos' || tipo === 'segmento' || tipo === 'data') {
    exportarBasePowerBI(orcamentos, projetos)
  } else if (tipo === 'orcamento') {
    exportarOrcamentos(orcamentos)
  } else if (tipo === 'projeto') {
    exportarProjetos(projetos)
  }
}
