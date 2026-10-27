import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { passwordStrength } from '../../lib/auth.js'
import { authItem, authStagger } from './authMotion.js'

export function AuthCard({ children, onSubmit }) {
  return (
    <motion.form className="auth-card" onSubmit={onSubmit} noValidate variants={authStagger} initial="hidden" animate="show">
      {children}
    </motion.form>
  )
}

export function AuthHeader({ icon, eyebrow, title, subtitle }) {
  return (
    <motion.div className="auth-header" variants={authItem}>
      {icon ? (
        <span className="auth-header-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {eyebrow ? <p className="auth-eyebrow">{eyebrow}</p> : null}
      <h1 className="auth-title">{title}</h1>
      {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
    </motion.div>
  )
}

const icons = {
  mail: (
    <path d="M4 6h16v12H4zM4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  briefcase: (
    <>
      <rect x="4" y="7.5" width="16" height="11.5" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M4 12.5h16" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
}

export function AuthIcon({ name, className = 'h-[1.05rem] w-[1.05rem]' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {icons[name]}
    </svg>
  )
}

export function AuthField({ label, icon, trailing, hint, children, id }) {
  return (
    <motion.div className="register-field" variants={authItem}>
      <label className="register-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-input-wrap">
        {icon ? (
          <span className="auth-input-icon">
            <AuthIcon name={icon} />
          </span>
        ) : null}
        {children}
        {trailing}
      </div>
      {hint}
    </motion.div>
  )
}

export function PasswordField({ id, label, value, onChange, autoComplete, placeholder, hint }) {
  const [visible, setVisible] = useState(false)
  return (
    <AuthField
      id={id}
      label={label}
      icon="lock"
      hint={hint}
      trailing={
        <button
          type="button"
          className="auth-input-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      }
    >
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className="register-input auth-input auth-input--trailing"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
    </AuthField>
  )
}

export function StrengthMeter({ password }) {
  const { score, label } = passwordStrength(password)
  const tone = !password ? 'idle' : score <= 1 ? 'danger' : score === 2 ? 'gold' : score === 3 ? 'copper' : 'sage'
  return (
    <div className="strength-meter" aria-live="polite">
      <div className="strength-meter-bars">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`strength-meter-bar ${password && i < Math.max(score, 1) ? `strength-meter-bar--${tone}` : ''}`} />
        ))}
      </div>
      <span className={`strength-meter-label strength-meter-label--${tone}`}>{label || '8+ characters, letters & numbers'}</span>
    </div>
  )
}

export function AuthReminder({ message }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          key={message}
          className="menu-add-reminder"
          role="status"
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22 }}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  )
}

export function SubmitButton({ loading, children, loadingLabel = 'Please wait…' }) {
  return (
    <motion.button type="submit" className="auth-submit" disabled={loading} variants={authItem} whileTap={{ scale: 0.985 }}>
      {loading ? (
        <>
          <span className="auth-spinner" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
