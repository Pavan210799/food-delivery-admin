import { motion } from 'framer-motion'
import ChartPanel from './ChartPanel.jsx'

const typeStyles = {
  order: 'from-copper/25 to-copper/5 text-copper-dark',
  restaurant: 'from-gold/25 to-gold/5 text-gold',
  refund: 'from-danger/20 to-danger/5 text-danger',
  partner: 'from-sage/25 to-sage/5 text-sage',
  promo: 'from-sand to-cream text-muted',
  payment: 'from-copper/15 to-copper/5 text-copper-dark',
}

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function RecentActivity({ items }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="h-full min-w-0"
    >
      <ChartPanel title="Recent activities" className="activity-panel" overflowVisible>
          <motion.ul
            className="flex flex-1 flex-col justify-between gap-2.5"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {items.map((item) => (
              <motion.li
                key={item.id}
                variants={itemVariants}
                whileHover={{ scale: 1.015, zIndex: 2 }}
                whileTap={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="activity-row group/item relative flex w-full cursor-default items-center gap-3 rounded-xl border border-line bg-gradient-to-r from-paper to-cream/40 py-2.5 pl-4 pr-3"
              >
                <span
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[0.6rem] font-bold uppercase transition-transform duration-300 group-hover/item:scale-105 ${typeStyles[item.type] ?? typeStyles.order}`}
                  aria-hidden="true"
                >
                  {item.type.slice(0, 2)}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-semibold transition-colors group-hover/item:text-copper-dark">
                  {item.title}
                </p>
                <time className="text-muted shrink-0 rounded-md bg-sand/80 px-2 py-0.5 text-xs font-bold tabular-nums transition-colors group-hover/item:bg-copper/10 group-hover/item:text-copper-dark">
                  {item.time}
                </time>
              </motion.li>
            ))}
          </motion.ul>
      </ChartPanel>
    </motion.div>
  )
}
