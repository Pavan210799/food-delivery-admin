import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'
import Logo from '../ui/Logo.jsx'

const SHOWCASE_IMAGE = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=75'

const stats = [
  { value: '12,847', label: 'Orders this week' },
  { value: '186', label: 'Live deliveries' },
  { value: '4.7★', label: 'Customer rating' },
]

export default function AuthLayout() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <div className="auth-shell">
      <aside className="auth-showcase" aria-hidden="true">
        <motion.img
          src={SHOWCASE_IMAGE}
          alt=""
          className="auth-showcase-img"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="auth-showcase-shade" />
        <div className="auth-showcase-content">
          <Logo className="text-paper" tone="light" />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="auth-showcase-eyebrow">Marlow operations console</p>
            <h2 className="auth-showcase-title">Every kitchen, courier and order — in one calm place.</h2>
            <p className="auth-showcase-sub">
              Approve restaurants, dispatch partners, settle payouts and keep customers happy from a single dashboard.
            </p>
            <div className="auth-stats">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  className="auth-stat"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.35 + i * 0.08 }}
                >
                  <p className="auth-stat-value">{s.value}</p>
                  <p className="auth-stat-label">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <figure className="auth-quote">
            <blockquote>“We cut dispatch time by 30% in the first month. The team actually enjoys using it.”</blockquote>
            <figcaption>Meera N. · Head of Operations</figcaption>
          </figure>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-main-inner">
          <div className="auth-mobile-brand">
            <Logo />
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
          <p className="auth-footer">© 2026 Marlow Technologies · Privacy · Terms</p>
        </div>
      </main>
    </div>
  )
}
