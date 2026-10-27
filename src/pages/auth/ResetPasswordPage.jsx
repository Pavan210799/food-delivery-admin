import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  AuthCard,
  AuthHeader,
  AuthIcon,
  AuthReminder,
  PasswordField,
  StrengthMeter,
  SubmitButton
} from '../../components/auth/AuthParts.jsx'
import { authItem } from '../../components/auth/authMotion.js'
import { getPendingReset, passwordReminder, resetPassword } from '../../lib/auth.js'

export default function ResetPasswordPage() {
  const [pending] = useState(getPendingReset)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [reminder, setReminder] = useState('')
  const [loading, setLoading] = useState(false)
  const [doneEmail, setDoneEmail] = useState(null)

  if (doneEmail) {
    return (
      <AuthCard onSubmit={(e) => e.preventDefault()}>
        <motion.div
          className="auth-success-icon"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8">
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </svg>
        </motion.div>
        <AuthHeader title="Password updated" subtitle="You’re all set. Sign in with your new password to get back to work." />
        <motion.div variants={authItem}>
          <Link to="/login" state={{ email: doneEmail }} className="auth-submit">
            Back to sign in
          </Link>
        </motion.div>
      </AuthCard>
    )
  }

  if (!pending?.verified) return <Navigate to="/forgot-password" replace />

  const submit = async (e) => {
    e.preventDefault()
    const pw = passwordReminder(password, confirm)
    if (pw) return setReminder(pw)
    setLoading(true)
    const result = await resetPassword(password)
    setLoading(false)
    if (!result.ok) return setReminder(result.error)
    setDoneEmail(result.email)
  }

  return (
    <AuthCard onSubmit={submit}>
      <AuthHeader
        icon={<AuthIcon name="lock" className="h-6 w-6" />}
        eyebrow="Almost there"
        title="Set a new password"
        subtitle={`Choose a strong password for ${pending.email}.`}
      />
      <PasswordField
        id="reset-password"
        label="New password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setReminder('')
        }}
        autoComplete="new-password"
        placeholder="At least 8 characters"
        hint={<StrengthMeter password={password} />}
      />
      <PasswordField
        id="reset-confirm"
        label="Confirm new password"
        value={confirm}
        onChange={(e) => {
          setConfirm(e.target.value)
          setReminder('')
        }}
        autoComplete="new-password"
        placeholder="Type it again"
      />
      <AuthReminder message={reminder} />
      <SubmitButton loading={loading} loadingLabel="Updating…">
        Update password
      </SubmitButton>
      <motion.p className="auth-switch" variants={authItem}>
        <Link to="/login" className="auth-link">
          ← Back to sign in
        </Link>
      </motion.p>
    </AuthCard>
  )
}
