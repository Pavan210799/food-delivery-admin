import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AuthCard,
  AuthField,
  AuthHeader,
  AuthReminder,
  PasswordField,
  SubmitButton,
} from '../../components/auth/AuthParts.jsx'
import { authItem } from '../../components/auth/authMotion.js'
import { useToast } from '../../components/ui/Toast.jsx'
import { EMAIL_RE, signIn } from '../../lib/auth.js'
import { useAuth } from '../../lib/authContext.js'

export default function LoginPage() {
  const notify = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [password, setPassword] = useState('')
  const [reminder, setReminder] = useState(location.state?.notice ?? '')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return setReminder('Enter your work email.')
    if (!EMAIL_RE.test(email.trim())) return setReminder('Enter a valid email.')
    if (!password) return setReminder('Enter your password.')
    setLoading(true)
    const result = await signIn({ email, password })
    setLoading(false)
    if (!result.ok) return setReminder(result.error)
    navigate(location.state?.from ?? '/', { replace: true })
    setSession(result.session)
    notify('Signed in')
  }

  return (
    <AuthCard onSubmit={submit}>
      <AuthHeader eyebrow="Sign in" title="Sign in to Marlow" subtitle="Manage orders, kitchens and payouts from one place." />

      <AuthField id="login-email" label="Work email" icon="mail">
        <input
          id="login-email"
          type="email"
          className="register-input auth-input"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setReminder('')
          }}
          autoComplete="off"
          placeholder="you@marlow.app"
        />
      </AuthField>

      <PasswordField
        id="login-password"
        label="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setReminder('')
        }}
        autoComplete="new-password"
        placeholder="Your password"
      />

      <motion.div className="auth-row auth-row--end" variants={authItem}>
        <Link to="/forgot-password" className="auth-link">
          Forgot password?
        </Link>
      </motion.div>

      <AuthReminder message={reminder} />
      <SubmitButton loading={loading} loadingLabel="Signing in…">
        Sign in
      </SubmitButton>

      <motion.p className="auth-switch" variants={authItem}>
        New to the team?{' '}
        <Link to="/register" className="auth-link">
          Create an account
        </Link>
      </motion.p>
    </AuthCard>
  )
}
