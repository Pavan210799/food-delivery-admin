import { useCallback, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { clearSession, getSession } from '../../lib/auth.js'
import { AuthContext, useAuth } from '../../lib/authContext.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getSession)

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(() => ({ session, setSession, signOut }), [session, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function RequireAuth({ children }) {
  const { session } = useAuth()
  const location = useLocation()
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

export function GuestOnly({ children }) {
  const { session } = useAuth()
  const location = useLocation()
  if (session) return <Navigate to={location.state?.from ?? '/'} replace />
  return children
}
