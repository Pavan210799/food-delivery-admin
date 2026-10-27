import { motion } from 'framer-motion'

export const detailBodyStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

export const detailBodyItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
}

/** Tab panels mount after DetailBody has animated — need their own show cascade. */
export const detailTabPanel = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.05, delayChildren: 0.02 },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } },
}

const statAccents = {
  copper: 'from-copper/18 to-copper/5 text-copper-dark',
  sage: 'from-sage/18 to-sage/5 text-sage',
  gold: 'from-gold/20 to-gold/6 text-gold',
  muted: 'from-sand to-paper text-muted',
}

/** Wrap in `<AnimatePresence mode="wait" initial={false}>` and key by tab id. */
export function DetailTabPanel({ children, className = 'space-y-4' }) {
  return (
    <motion.div variants={detailTabPanel} initial="hidden" animate="show" exit="exit" className={className}>
      {children}
    </motion.div>
  )
}

export function DetailBody({ children, className = '' }) {
  return (
    <motion.div
      className={`detail-modal-body space-y-5 ${className}`}
      variants={detailBodyStagger}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}

export function DetailSection({ title, children, className = '' }) {
  return (
    <motion.section className={className} variants={detailBodyItem}>
      {title ? (
        <h4 className="detail-section-title mb-3 flex items-center gap-2">
          <span className="bg-copper/80 h-4 w-1 rounded-full" aria-hidden="true" />
          {title}
        </h4>
      ) : null}
      {children}
    </motion.section>
  )
}

export function DetailStat({ label, value, hint, accent = 'copper', icon }) {
  const tone = statAccents[accent] ?? statAccents.copper
  return (
    <motion.div className={`detail-stat-card bg-gradient-to-br ${tone}`} variants={detailBodyItem}>
      {icon ? (
        <span className="detail-stat-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="detail-stat-label">{label}</p>
        <p className="detail-stat-value">{value}</p>
        {hint ? <p className="detail-stat-hint">{hint}</p> : null}
      </div>
    </motion.div>
  )
}

export function DetailStatGrid({ children }) {
  return <div className="detail-stat-grid">{children}</div>
}

export function DetailHighlightPanel({ tone = 'copper', children }) {
  const ring =
    tone === 'danger'
      ? 'border-danger/25 bg-gradient-to-br from-danger/10 via-paper/80 to-paper'
      : 'border-copper/22 bg-gradient-to-br from-copper/10 via-paper/85 to-paper'
  return (
    <motion.div className={`detail-highlight-panel ${ring}`} variants={detailBodyItem}>
      {children}
    </motion.div>
  )
}
