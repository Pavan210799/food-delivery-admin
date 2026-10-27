import { motion } from 'framer-motion'

export default function TabBar({ tabs, active, onChange, layoutId, variant = 'detail', className = '' }) {
  return (
    <div className={`${variant === 'page' ? 'page-tab-bar' : 'detail-tab-bar'} ${className}`} role="tablist">
      {tabs.map((t) => {
        const isActive = active === t.id
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={(e) => {
              if (variant === 'page') e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
              onChange(t.id)
            }}
            className={`detail-tab-btn ${isActive ? 'detail-tab-btn--active' : ''}`}
          >
            {isActive ? (
              <motion.span
                layoutId={layoutId}
                className="detail-tab-indicator"
                transition={{ type: 'spring', stiffness: 480, damping: 34 }}
              />
            ) : null}
            <span className="relative z-[1] whitespace-nowrap">
              {t.label}
              {t.count != null ? <span className="tab-count">{t.count}</span> : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}
