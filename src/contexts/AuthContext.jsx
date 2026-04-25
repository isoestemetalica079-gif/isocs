import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
          const dados = snap.exists() ? snap.data() : {}
          setPerfil(dados)
        } catch (e) {
          console.error('Erro ao carregar perfil:', e)
          setPerfil({})
        }
        setUser(firebaseUser)
      } else {
        setUser(null)
        setPerfil(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = (email, senha) => signInWithEmailAndPassword(auth, email, senha)
  const logout = () => signOut(auth)
  const resetSenha = (email) => sendPasswordResetEmail(auth, email)

  return (
    <AuthContext.Provider value={{ user, perfil, loading, login, logout, resetSenha }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
