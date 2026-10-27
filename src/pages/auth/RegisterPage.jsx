import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AuthCard,
  AuthField,
  AuthHeader,
  AuthReminder,
  PasswordField,
  StrengthMeter,
  SubmitButton
} from '../../components/auth/AuthParts.jsx'
import { authItem } from '../../components/auth/authMotion.js'
import { useToast } from '../../components/ui/Toast.jsx'
import { EMAIL_RE, passwordReminder, signUp } from '../../lib/auth.js'
import { useAuth } from '../../lib/authContext.js'

const roles = ['Operations', 'Finance', 'Support agent']

export default function RegisterPage() {
  const notify = useToast()
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', role: roles[0], password: '', confirm: '', terms: false })
  const [reminder, setReminder] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
    setReminder('')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (form.name.trim().length < 2) return setReminder('Name is required.')
    if (!EMAIL_RE.test(form.email.trim())) return setReminder('Enter a valid work email.')
    const pw = passwordReminder(form.password, form.confirm)
    if (pw) return setReminder(pw)
    if (!form.terms) return setReminder('Accept the terms to continue.')
    setLoading(true)
    const result = await signUp(form)
    setLoading(false)
    if (!result.ok) return setReminder(result.error)
    navigate('/', { replace: true })
    setSession(result.session)
    notify('Account created')
  }

  return (
    <AuthCard onSubmit={submit}>
      <AuthHeader eyebrow="Join the team" title="Create your account" subtitle="Get access to the Marlow admin console in under a minute." />

      <AuthField id="reg-name" label="Full name" icon="user">
        <input id="reg-name" className="register-input auth-input" value={form.name} onChange={set('name')} autoComplete="name" placeholder="Jordan Lee" />
      </AuthField>

      <AuthField id="reg-email" label="Work email" icon="mail">
        <input
          id="reg-email"
          type="email"
          className="register-input auth-input"
          value={form.email}
          onChange={set('email')}
          autoComplete="email"
          placeholder="jordan@marlow.app"
        />
      </AuthField>

      <AuthField id="reg-role" label="Team" icon="briefcase">
        <select id="reg-role" className="register-input auth-input" value={form.role} onChange={set('role')}>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </AuthField>

      <PasswordField
        id="reg-password"
        label="Password"
        value={form.password}
        onChange={set('password')}
        autoComplete="new-password"
        placeholder="Create a password"
        hint={<StrengthMeter password={form.password} />}
      />
      <PasswordField
        id="reg-confirm"
        label="Confirm password"
        value={form.confirm}
        onChange={set('confirm')}
        autoComplete="new-password"
        placeholder="Type it again"
      />

      <motion.label className="auth-check auth-check--block" variants={authItem}>
        <input type="checkbox" checked={form.terms} onChange={set('terms')} />
        <span className="auth-check-box" aria-hidden="true" />
        <span>
          I agree to the <span className="auth-link">Terms of Service</span> and <span className="auth-link">Privacy Policy</span>
        </span>
      </motion.label>

      <AuthReminder message={reminder} />
      <SubmitButton loading={loading} loadingLabel="Creating account…">
        Create account
      </SubmitButton>

      <motion.p className="auth-switch" variants={authItem}>
        Already have an account?{' '}
        <Link to="/login" className="auth-link">
          Sign in
        </Link>
      </motion.p>
    </AuthCard>
  )
}
