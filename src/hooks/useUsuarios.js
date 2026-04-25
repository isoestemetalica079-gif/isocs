import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState, useMemo } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

export function useUsuarios() {
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, 'usuarios'), where('ativo', '==', true))
    const unsub = onSnapshot(q, (snap) => {
      const dados = snap.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome || doc.data().email || 'Sem nome'
      }))
      setUsuarios(dados)
    })

    return () => unsub()
  }, [user])

  return useMemo(() => usuarios.map(u => u.nome), [usuarios])
}
