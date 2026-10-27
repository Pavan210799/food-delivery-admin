import { AnimatePresence, motion } from 'framer-motion'
import { useId } from 'react'

export default function Pagination({ page, totalPages, rangeStart, rangeEnd, total, onPage }) {
  const indicatorId = `pagination-${useId()}`
  if (total === 0) return null

  const pages = []
  for (let p = 1; p <= totalPages; p += 1) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  return (
    <div className="border-line flex min-w-0 flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted text-xs font-semibold tabular-nums sm:text-sm">
        Showing{' '}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={`${rangeStart}-${rangeEnd}`}
            className="text-ink inline-block"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {rangeStart}–{rangeEnd}
          </motion.span>
        </AnimatePresence>{' '}
        of <span className="text-ink">{total}</span>
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <motion.button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          whileTap={page > 1 ? { scale: 0.94 } : undefined}
          className="border-line bg-paper hover:bg-cream disabled:text-muted/50 rounded-lg border px-3 py-1.5 text-xs font-bold disabled:cursor-not-allowed"
        >
          Prev
        </motion.button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e-${i}`} className="text-muted px-1 text-xs">
              …
            </span>
          ) : (
            <motion.button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              whileTap={{ scale: 0.92 }}
              aria-current={p === page ? 'page' : undefined}
              className={`relative min-w-[2.25rem] rounded-lg border px-2.5 py-1.5 text-xs font-bold tabular-nums transition-colors ${
                p === page ? 'border-copper/40 text-paper' : 'border-line bg-paper text-muted hover:bg-cream hover:text-ink'
              }`}
            >
              {p === page ? (
                <motion.span
                  layoutId={indicatorId}
                  className="bg-copper absolute -inset-px rounded-lg shadow-[0_4px_12px_rgba(196,92,38,0.22)]"
                  transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                />
              ) : null}
              <span className="relative">{p}</span>
            </motion.button>
          ),
        )}
        <motion.button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          whileTap={page < totalPages ? { scale: 0.94 } : undefined}
          className="border-line bg-paper hover:bg-cream disabled:text-muted/50 rounded-lg border px-3 py-1.5 text-xs font-bold disabled:cursor-not-allowed"
        >
          Next
        </motion.button>
      </div>
    </div>
  )
}
