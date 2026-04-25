import { useEffect, useState } from 'react'
import { Award } from 'lucide-react'
import { subscribe, addDoc_, updateDoc_, deleteDoc_, COLS } from '../firebase/firestore'
import { exportarART } from '../firebase/exportacao'
import { useAuth } from '../contexts/AuthContext'
import TabelaGenerica from '../components/TabelaGenerica'
import ARTForm from '../components/forms/ARTForm'

const COLUNAS = [
  { key: 'status', label: 'Status', tipo: 'status' },
  { key: 'fluig', label: 'FLUIG' },
  { key: 'mf', label: 'MF' },
  { key: 'mes', label: 'Mês' },
  { key: 'obra', label: 'Obra', truncar: true },
  { key: 'modalidade', label: 'Modalidade' },
  { key: 'nArt', label: 'Nº ART' },
  { key: 'area', label: 'Área (m²)', tipo: 'numero' },
  { key: 'valorTotal', label: 'Valor Total', tipo: 'moeda' },
  { key: 'responsavelTecnico', label: 'Responsável' },
  { key: 'entrada', label: 'Entrada', tipo: 'data' },
  { key: 'saida', label: 'Saída', tipo: 'data' },
  { key: 'fechado', label: 'Fechado?' },
]

export default function ART() {
  const { perfil } = useAuth()
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribe(COLS.art, lista => {
      setDados(lista.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0)))
      setLoading(false)
    })
    return unsub
  }, [])

  const podeEditar = ['gestor', 'tecnico'].includes(perfil?.perfil)

  return (
    <TabelaGenerica
      titulo="ART"
      icone={Award}
      dados={dados}
      loading={loading}
      colunas={COLUNAS}
      podeEditar={podeEditar}
      podeExcluir={perfil?.perfil === 'gestor'}
      FormComponent={ARTForm}
      formTitulo="ART"
      onSalvar={async (form, editando) => {
        if (editando) await updateDoc_(COLS.art, editando.id, form)
        else await addDoc_(COLS.art, form)
      }}
      onDeletar={id => deleteDoc_(COLS.art, id)}
      onExportar={() => exportarART(dados)}
      filtros={[
        { key: 'status', label: 'Todos os status' },
        { key: 'mes', label: 'Todos os meses' },
        { key: 'modalidade', label: 'Todas as modalidades' },
      ]}
    />
  )
}
