export default function ModuleHeader({ title, subtitle, actionLabel, onAction, children }) {
  return (
    <div className="module-page-header-row">
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
        {subtitle ? <p className="text-muted text-xs font-medium">{subtitle}</p> : null}
      </div>
      {children}
      {actionLabel ? (
        <button type="button" onClick={onAction} className="register-kitchen-btn">
          <span aria-hidden="true">+</span>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
