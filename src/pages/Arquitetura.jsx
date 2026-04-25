import { useEffect, useState } from 'react'
import { Ruler } from 'lucide-react'
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
  { key: 'tipologia', label: 'Tipologia' },
  { key: 'area', label: 'Área (m²)', tipo: 'numero' },
  { key: 'rTotal', label: 'R$ Total', tipo: 'moeda' },
  { key: 'entrada', label: 'Entrada', tipo: 'data' },
  { key: 'saida', label: 'Saída', tipo: 'data' },
  { key: 'sla', label: 'SLA' },
]

export default function Arquitetura() {
  const { perfil } = useAuth()
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribe(COLS.arquitetura, lista => {
      setDados(lista.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0)))
      setLoading(false)
    })
    return unsub
  }, [])

  const podeEditar = ['gestor', 'tecnico'].includes(perfil?.perfil)

  return (
    <TabelaGenerica
      titulo="Arquitetura"
      icone={Ruler}
      dados={dados}
      loading={loading}
      colunas={COLUNAS}
      podeEditar={podeEditar}
      podeExcluir={perfil?.perfil === 'gestor'}
      FormComponent={(props) => <CalculoForm {...props} titulo="Arquitetura" />}
      formTitulo="Projeto Arquitetura"
      onSalvar={async (form, editando) => {
        if (editando) await updateDoc_(COLS.arquitetura, editando.id, form)
        else await addDoc_(COLS.arquitetura, form)
      }}
      onDeletar={id => deleteDoc_(COLS.arquitetura, id)}
      onExportar={() => exportarArquitetura(dados)}
      filtros={[{ key: 'mes', label: 'Todos os meses' }, { key: 'tipologia', label: 'Todas as tipologias' }]}
    />
  )
}
