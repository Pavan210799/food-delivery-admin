import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

export default function MiniBars({ data, format = (v) => v, tone = 'copper', height = 'h-32' }) {
  const [active, setActive] = useState(null)
  const plotRef = useRef(null)
  const inView = useInView(plotRef, { once: true, amount: 0.3 })
  const max = Math.max(...data.map((d) => d.value), 1)
  const shown = active != null ? data[active] : null

  return (
    <div className="mini-bars">
      <p className="text-muted mb-2 h-4 text-xs font-bold tabular-nums">
        {shown ? `${shown.label} · ${format(shown.value)}` : `Peak · ${format(max)}`}
      </p>
      <div ref={plotRef} className={`mini-bars-plot ${height}`} style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
        {data.map((d, i) => (
          <button
            key={d.label}
            type="button"
            className="mini-bars-col"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            aria-label={`${d.label}: ${format(d.value)}`}
          >
            <motion.span
              className={`mini-bars-bar mini-bars-bar--${tone} ${active === i ? 'mini-bars-bar--active' : ''}`}
              initial={{ height: 0 }}
              animate={{ height: inView ? `${Math.max((d.value / max) * 100, 4)}%` : 0 }}
              transition={{ duration: 0.65, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            />
          </button>
        ))}
      </div>
      <div className="mini-bars-labels" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
        {data.map((d) => (
          <span key={d.label} className="truncate">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}
