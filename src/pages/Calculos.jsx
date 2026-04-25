import { useEffect, useState } from 'react'
import { Calculator } from 'lucide-react'
import { subscribe, addDoc_, updateDoc_, deleteDoc_, COLS } from '../firebase/firestore'
import { exportarArquitetura } from '../firebase/exportacao'
import { useAuth } from '../contexts/AuthContext'
import TabelaGenerica from '../components/TabelaGenerica'
import CalculoForm from '../components/forms/CalculoForm'

const COLUNAS = [
  { key: 'id', label: 'ID' },
  { key: 'mf', label: 'MF' },
  { key: 'fluig', label: 'FLUIG' },
  { key: 'mes', label: 'Mês' },
  { key: 'cliente', label: 'Cliente', truncar: true },
  { key: 'projeto', label: 'Projeto', truncar: true },
  { key: 'tecnico', label: 'Técnico' },
  { key: 'area', label: 'Área (m²)', tipo: 'numero' },
  { key: 'rTotal', label: 'R$ Total', tipo: 'moeda' },
  { key: 'entrada', label: 'Entrada', tipo: 'data' },
  { key: 'saida', label: 'Saída', tipo: 'data' },
  { key: 'sla', label: 'SLA' },
  { key: 'lead', label: 'Lead' },
]

export default function Calculos() {
  const { perfil } = useAuth()
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribe(COLS.calculos, lista => {
      setDados(lista.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0)))
      setLoading(false)
    })
    return unsub
  }, [])

  const podeEditar = ['gestor', 'tecnico'].includes(perfil?.perfil)

  const handleSalvar = async (form, editando) => {
    if (editando) await updateDoc_(COLS.calculos, editando.id, form)
    else await addDoc_(COLS.calculos, form)
  }

  return (
    <TabelaGenerica
      titulo="Cálculos"
      icone={Calculator}
      dados={dados}
      loading={loading}
      colunas={COLUNAS}
      podeEditar={podeEditar}
      podeExcluir={perfil?.perfil === 'gestor'}
      FormComponent={(props) => <CalculoForm {...props} titulo="Cálculo" />}
      formTitulo="Cálculo"
      onSalvar={handleSalvar}
      onDeletar={id => deleteDoc_(COLS.calculos, id)}
      onExportar={() => exportarArquitetura(dados)}
      filtros={[{ key: 'mes', label: 'Todos os meses' }, { key: 'tecnico', label: 'Todos os técnicos' }]}
    />
  )
}
