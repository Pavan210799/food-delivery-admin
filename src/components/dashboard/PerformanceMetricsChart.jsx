import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import ChartPanel from './ChartPanel.jsx'

function displayValue(item) {
  if (item.unit === '$') return `$${item.value}`
  return `${item.value}${item.unit}`
}

export default function PerformanceMetricsChart({ metrics }) {
  const [activeId, setActiveId] = useState(null)
  const plotRef = useRef(null)
  const inView = useInView(plotRef, { once: true, amount: 0.35 })

  return (
    <ChartPanel
      title="Performance"
      legend={
        <span className="text-muted">
          Platform <span className="text-ink font-bold">health</span>
        </span>
      }
    >
      <div
        ref={plotRef}
        className="chart-plot flex min-h-[12rem] flex-1 flex-col justify-center gap-3 rounded-xl bg-gradient-to-br from-sage/[0.07] via-transparent to-copper/[0.04] p-3"
        onMouseLeave={() => setActiveId(null)}
      >
        {metrics.map((item, index) => {
          const isActive = activeId === item.id
          return (
            <div
              key={item.id}
              className="cursor-pointer"
              onMouseEnter={() => setActiveId(item.id)}
            >
              <div className="mb-1 flex items-center justify-between gap-2 text-xs font-semibold">
                <span className={`min-w-0 truncate ${isActive ? 'text-sage' : 'text-ink'}`}>{item.label}</span>
                <span className="shrink-0 font-bold tabular-nums">{displayValue(item)}</span>
              </div>
              <div className="bg-line/45 h-2.5 overflow-hidden rounded-full">
                <motion.div
                  className={`h-full rounded-full transition-[opacity,box-shadow] ${isActive ? 'opacity-100' : 'opacity-85'}`}
                  style={{
                    background: item.gradient,
                    boxShadow: isActive ? `0 0 14px ${item.glow}` : 'none',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: inView ? `${item.progress}%` : 0 }}
                  transition={{ duration: 0.9, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </ChartPanel>
  )
}
