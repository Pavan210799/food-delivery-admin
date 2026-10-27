import { motion } from 'framer-motion'
import CountUp from '../ui/CountUp.jsx'

const chipStyles = {
  copper: 'text-copper-dark bg-copper/15',
  sage: 'text-sage bg-sage/15',
  gold: 'text-gold bg-gold/15',
  danger: 'text-danger bg-danger/12',
}

const iconStyles = {
  copper: 'from-copper/30 to-copper/10 text-copper',
  sage: 'from-sage/30 to-sage/10 text-sage',
  gold: 'from-gold/35 to-gold/12 text-gold',
  danger: 'from-danger/25 to-danger/8 text-danger',
}

const floatGlow = {
  copper: 'bg-copper/25',
  sage: 'bg-sage/20',
  gold: 'bg-gold/22',
  danger: 'bg-danger/18',
}

const accentRgb = {
  copper: '196, 92, 38',
  sage: '36, 84, 60',
  gold: '141, 107, 50',
  danger: '140, 46, 46',
}

const snappy = { type: 'spring', stiffness: 520, damping: 30 }
const bouncy = { type: 'spring', stiffness: 560, damping: 16 }

const cardVariants = {
  rest: { y: 0, transition: snappy },
  hover: { y: -6, transition: snappy },
  tap: { y: -3, transition: snappy },
}

const iconVariants = {
  rest: { y: 0, rotate: 0, transition: bouncy },
  hover: { y: -5, rotate: -10, transition: bouncy },
  tap: { y: -3, rotate: -6, transition: bouncy },
}

const glowVariants = {
  rest: { opacity: 0.5, y: 6, transition: snappy },
  hover: { opacity: 0.95, y: 12, transition: snappy },
  tap: { opacity: 0.8, y: 9, transition: snappy },
}

const icons = {
  orders: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6h15l-1.5 9h-12L6 6Z" strokeLinejoin="round" />
      <path d="M6 6 5 3H2" strokeLinecap="round" />
      <circle cx="9" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17" cy="19" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  revenue: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 18V6M8 18V10M12 18V14M16 18V8M20 18V4" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c0-3.3 2.7-5 6-5s6 1.7 6 5" strokeLinecap="round" />
      <path d="M16 11h5M18.5 8.5v5" strokeLinecap="round" />
    </svg>
  ),
  deliveries: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7h11v8H3V7Z" strokeLinejoin="round" />
      <path d="M14 10h4l3 3v2h-7v-5Z" strokeLinejoin="round" />
      <circle cx="7" cy="17" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="17" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  pending: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  confirmed: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 4h8M9 4v2.5h6V4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 5.5H5v15h14v-15h-1" strokeLinejoin="round" />
      <path d="m9 13.5 2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  refunds: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 7 5 11l4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 11h9a5 5 0 0 1 0 10h-2" strokeLinecap="round" />
    </svg>
  ),
  store: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 9.5 5.5 4h13L20 9.5" strokeLinejoin="round" />
      <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" strokeLinejoin="round" />
      <path d="M5.5 12v8h13v-8M10 20v-4.5h4V20" strokeLinejoin="round" />
    </svg>
  ),
  active: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.4 2.4 4.6-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  approval: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 3.5h10M7 20.5h10" strokeLinecap="round" />
      <path d="M8 3.5c0 4 4 5 4 8.5s-4 4.5-4 8.5M16 3.5c0 4-4 5-4 8.5s4 4.5 4 8.5" strokeLinejoin="round" />
    </svg>
  ),
  verification: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 5 6v5.5c0 4.3 3 7.8 7 9.5 4-1.7 7-5.2 7-9.5V6l-7-3Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  partners: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17 9.5 9H14l4 8M9.5 9 12 17h3M14 9l1-3h2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  online: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12.5a10 10 0 0 1 14 0M8 15.5a5.5 5.5 0 0 1 8 0" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  rating: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" strokeLinejoin="round" />
    </svg>
  ),
  spend: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v4" strokeLinejoin="round" />
      <path d="M4 7.5V17a2 2 0 0 0 2 2h14V9H6.5A2.5 2.5 0 0 1 4 7.5Z" strokeLinejoin="round" />
      <circle cx="16" cy="14" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  ),
  complaints: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5h16v11H9l-5 4V5Z" strokeLinejoin="round" />
      <path d="M12 8.5v3.5" strokeLinecap="round" />
      <circle cx="12" cy="14" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  commission: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18" strokeLinecap="round" />
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  ),
  settlement: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9.5 12 4l9 5.5M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  failed: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8.5" />
      <path d="m9 9 6 6M15 9l-6 6" strokeLinecap="round" />
    </svg>
  ),
  campaign: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10v4h3l7 4V6L7 10H4Z" strokeLinejoin="round" />
      <path d="M17.5 9a4 4 0 0 1 0 6" strokeLinecap="round" />
    </svg>
  ),
  redemptions: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4V8Z" strokeLinejoin="round" />
      <path d="M14 6v12" strokeDasharray="2 2" />
    </svg>
  ),
  discount: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3.5 12.5 12 4h7.5v7.5L11 20a1.5 1.5 0 0 1-2.1 0L3.5 14.6a1.5 1.5 0 0 1 0-2.1Z" strokeLinejoin="round" />
      <circle cx="15.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  referral: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M3 9h18M12 9v11M12 9c-1.5-4-6-4-6-1.5S10 9 12 9Zm0 0c1.5-4 6-4 6-1.5S14 9 12 9Z" strokeLinejoin="round" />
    </svg>
  ),
  tickets: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 13 6.5 5h11L20 13v6H4v-6Z" strokeLinejoin="round" />
      <path d="M4 13h4.5l1 2h5l1-2H20" strokeLinejoin="round" />
    </svg>
  ),
  disputes: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 4v16M7 20h10M5 7h14" strokeLinecap="round" />
      <path d="m5 7-2.5 6a2.5 2.5 0 0 0 5 0L5 7ZM19 7l-2.5 6a2.5 2.5 0 0 0 5 0L19 7Z" strokeLinejoin="round" />
    </svg>
  ),
  csat: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 14a4 4 0 0 0 7 0" strokeLinecap="round" />
      <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
}

export default function MetricCard({ id, label, value, change, trend, accent = 'copper', index = 0 }) {
  const chip = chipStyles[accent] ?? chipStyles.copper
  const iconRing = iconStyles[accent] ?? iconStyles.copper
  const glow = floatGlow[accent] ?? floatGlow.copper
  const trendClass =
    trend === 'up' ? 'text-sage' : trend === 'down' ? 'text-danger' : trend === 'neutral' ? 'text-copper' : ''

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.article
        className="chart-panel kpi-card relative h-full overflow-hidden px-4 py-3 sm:px-5 sm:py-3.5"
        style={{ '--kpi-rgb': accentRgb[accent] ?? accentRgb.copper }}
        variants={cardVariants}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap="tap"
      >
        <div className="kpi-spotlight" aria-hidden="true" />

        <div className="relative z-[1] flex min-h-[5rem] items-center">
          <div className="kpi-icon-wrap absolute right-0 top-1/2 -translate-y-1/2">
            <motion.span
              className={`pointer-events-none absolute inset-0 rounded-2xl blur-xl ${glow}`}
              variants={glowVariants}
              aria-hidden="true"
            />
            <motion.span
              className={`kpi-icon-tile relative z-[1] inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${iconRing} [&_svg]:h-6 [&_svg]:w-6`}
              variants={iconVariants}
            >
              {icons[id] ?? icons.orders}
            </motion.span>
          </div>

          <div className="flex h-full min-h-[5rem] max-w-[calc(100%-3.75rem)] flex-col justify-center gap-1 text-left">
            <p className="text-muted text-xs font-semibold sm:text-sm">{label}</p>
            <p className="kpi-value font-display text-2xl font-bold leading-tight tracking-tight tabular-nums">
              <CountUp value={value} delay={0.15 + index * 0.08} />
            </p>
            <p className={`inline-flex max-w-full rounded-full px-2.5 py-0.5 text-xs font-bold ${chip} ${trendClass}`}>
              {change}
            </p>
          </div>
        </div>
      </motion.article>
    </motion.div>
  )
}
