export default function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <label className={`toggle-row ${disabled ? 'toggle-row--disabled' : ''}`}>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{label}</span>
        {description ? <span className="text-muted mt-0.5 block text-xs font-medium">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`toggle-switch ${checked ? 'toggle-switch--on' : ''}`}
      >
        <span className="toggle-knob" />
      </button>
    </label>
  )
}
