import { createContext, useContext } from 'react'

export const AuthContext = createContext({ session: null, setSession: () => {}, signOut: () => {} })

export function useAuth() {
  return useContext(AuthContext)
}
