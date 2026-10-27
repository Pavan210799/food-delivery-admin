import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthCard, AuthHeader, AuthIcon, AuthReminder, SubmitButton } from '../../components/auth/AuthParts.jsx'
import { authItem } from '../../components/auth/authMotion.js'
import { useToast } from '../../components/ui/Toast.jsx'
import { getPendingReset, verifyResetCode } from '../../lib/auth.js'

const LENGTH = 6
const RESEND_SECONDS = 30

function maskEmail(email) {
  const [user, domain] = email.split('@')
  return `${user.slice(0, 2)}${'•'.repeat(Math.max(user.length - 2, 1))}@${domain}`
}

export default function VerifyCodePage() {
  const notify = useToast()
  const navigate = useNavigate()
  const [pending] = useState(getPendingReset)
  const [digits, setDigits] = useState(Array(LENGTH).fill(''))
  const [reminder, setReminder] = useState('')
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(RESEND_SECONDS)
  const inputs = useRef([])

  useEffect(() => {
    if (seconds <= 0) return undefined
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  if (!pending) return <Navigate to="/forgot-password" replace />

  const focus = (i) => inputs.current[Math.min(Math.max(i, 0), LENGTH - 1)]?.focus()

  const setAt = (i, value) => {
    const chars = value.replace(/\D/g, '').split('')
    if (chars.length === 0) {
      setDigits((d) => d.map((x, j) => (j === i ? '' : x)))
      return
    }
    setDigits((d) => {
      const next = [...d]
      chars.forEach((c, k) => {
        if (i + k < LENGTH) next[i + k] = c
      })
      return next
    })
    focus(i + chars.length)
    setReminder('')
  }

  const submit = async (e) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < LENGTH) return setReminder('Enter the full 6-digit code.')
    setLoading(true)
    const result = await verifyResetCode(code)
    setLoading(false)
    if (!result.ok) {
      setReminder(result.error)
      setDigits(Array(LENGTH).fill(''))
      focus(0)
      return
    }
    navigate('/reset-password')
  }

  return (
    <AuthCard onSubmit={submit}>
      <AuthHeader
        icon={<AuthIcon name="mail" className="h-6 w-6" />}
        eyebrow="Check your inbox"
        title="Enter verification code"
        subtitle={`We sent a 6-digit code to ${maskEmail(pending.email)}.`}
      />

      <motion.div className="otp-row" variants={authItem}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el
            }}
            className={`otp-box ${d ? 'otp-box--filled' : ''}`}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={LENGTH}
            value={d}
            aria-label={`Digit ${i + 1}`}
            autoFocus={i === 0}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !digits[i]) focus(i - 1)
              if (e.key === 'ArrowLeft') focus(i - 1)
              if (e.key === 'ArrowRight') focus(i + 1)
            }}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </motion.div>

      <AuthReminder message={reminder} />
      <SubmitButton loading={loading} loadingLabel="Verifying…">
        Verify code
      </SubmitButton>

      <motion.p className="auth-switch auth-switch--split" variants={authItem}>
        <span className="whitespace-nowrap">
          Didn’t get it?{' '}
          {seconds > 0 ? (
            <span className="tabular-nums">Resend in 0:{String(seconds).padStart(2, '0')}</span>
          ) : (
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setSeconds(RESEND_SECONDS)
                notify('A fresh code is on its way', 'info')
              }}
            >
              Resend code
            </button>
          )}
        </span>
        <Link to="/forgot-password" className="auth-link whitespace-nowrap">
          Change email
        </Link>
      </motion.p>
    </AuthCard>
  )
}
