export default function FormField({ label, hint, children, className = '' }) {
  return (
    <label className={`register-field ${className}`}>
      <span className="register-field-label">{label}</span>
      {children}
      {hint ? <span className="text-muted text-[0.6875rem] font-medium">{hint}</span> : null}
    </label>
  )
}

export function FormReminder({ message }) {
  if (!message) return null
  return (
    <p className="menu-add-reminder" role="status">
      {message}
    </p>
  )
}
