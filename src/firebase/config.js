import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDIKxQjZPjAwZuR9zTolBsY8dyGvGRdJxw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'isocs-f91df.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'isocs-f91df',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'isocs-f91df.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1081664491243',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1081664491243:web:99c4752daaefe0c0b8f8ae',
}

let auth, db, app

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  console.log('Firebase initialized successfully')
} catch (e) {
  console.error('Firebase init error:', e)
  // Export undefined but don't crash
}

export { auth, db }
export default app
