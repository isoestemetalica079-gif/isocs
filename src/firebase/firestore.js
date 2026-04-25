import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy, serverTimestamp, onSnapshot
} from 'firebase/firestore'
import { db } from './config'

const COLS = {
  orcamentos: 'orcamentos',
  projetos: 'projetos',
  calculos: 'calculos',
  arquitetura: 'arquitetura',
  art: 'art',
  usuarios: 'usuarios',
  // Configurações do Sistema (Semana 1-6)
  configuracoes: 'configuracoes',
  campos_dinamicos: 'campos_dinamicos',
  regras_condicionais: 'regras_condicionais',
  permissoes_campos: 'permissoes_campos',
  kpis_customizados: 'kpis_customizados',
  mensagens_globais: 'mensagens_globais',
  automacoes: 'automacoes',
  auditoria_configuracoes: 'auditoria_configuracoes',
}

export const addDoc_ = (col, data) =>
  addDoc(collection(db, col), { ...data, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp() })

export const updateDoc_ = (col, id, data) =>
  updateDoc(doc(db, col, id), { ...data, atualizadoEm: serverTimestamp() })

export const deleteDoc_ = (col, id) =>
  deleteDoc(doc(db, col, id))

export const getAll = async (col, filters = []) => {
  let q = collection(db, col)
  if (filters.length) q = query(q, ...filters)
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getOne = async (col, id) => {
  const snap = await getDoc(doc(db, col, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const subscribe = (col, callback, filters = [], onError = undefined) => {
  let q = collection(db, col)
  if (filters.length) q = query(q, ...filters)
  return onSnapshot(
    q,
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export { COLS, where, orderBy }
