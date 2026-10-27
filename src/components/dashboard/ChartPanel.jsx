import { motion } from 'framer-motion'

export default function ChartPanel({ title, legend, children, className = '', overflowVisible = false }) {
  const overflow = overflowVisible ? 'overflow-visible' : 'overflow-hidden'

  return (
    <motion.section
      className={`chart-panel dashboard-card group/panel relative flex h-full min-h-[20rem] flex-col ${overflow} p-4 sm:min-h-[22rem] sm:p-5 ${className}`}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-copper/[0.05] opacity-80 blur-2xl transition-opacity duration-500 group-hover/panel:opacity-100" />
      </div>
      <div className="relative mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h2 className="font-display min-w-0 flex-1 truncate text-base font-bold tracking-tight sm:text-lg">
          {title}
        </h2>
        {legend ? (
          <div className="border-line bg-paper/80 flex flex-wrap items-center gap-3 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition-shadow group-hover/panel:shadow-md">
            {legend}
          </div>
        ) : null}
      </div>
      <div className={`relative flex min-h-0 flex-1 flex-col justify-end ${overflow}`}>{children}</div>
    </motion.section>
  )
}
