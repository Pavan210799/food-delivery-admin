import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard, AuthField, AuthHeader, AuthIcon, AuthReminder, SubmitButton } from '../../components/auth/AuthParts.jsx'
import { authItem } from '../../components/auth/authMotion.js'
import { useToast } from '../../components/ui/Toast.jsx'
import { EMAIL_RE, requestPasswordReset } from '../../lib/auth.js'

export default function ForgotPasswordPage() {
  const notify = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [reminder, setReminder] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) return setReminder('Enter a valid email.')
    setLoading(true)
    const result = await requestPasswordReset(email)
    setLoading(false)
    if (!result.ok) return setReminder(result.error)
    notify(`Code sent to ${email.trim()}`, 'info')
    navigate('/verify-code')
  }

  return (
    <AuthCard onSubmit={submit}>
      <AuthHeader
        icon={<AuthIcon name="lock" className="h-6 w-6" />}
        eyebrow="Password help"
        title="Forgot your password?"
        subtitle="No worries — enter your work email and we’ll send a 6-digit code to reset it."
      />
      <AuthField id="forgot-email" label="Work email" icon="mail">
        <input
          id="forgot-email"
          type="email"
          className="register-input auth-input"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setReminder('')
          }}
          autoComplete="email"
          placeholder="you@marlow.app"
          autoFocus
        />
      </AuthField>
      <AuthReminder message={reminder} />
      <SubmitButton loading={loading} loadingLabel="Sending code…">
        Send reset code
      </SubmitButton>
      <motion.p className="auth-switch" variants={authItem}>
        <Link to="/login" className="auth-link">
          ← Back to sign in
        </Link>
      </motion.p>
    </AuthCard>
  )
}
