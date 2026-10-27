import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import ChartPanel from './ChartPanel.jsx'
import ChartTooltip from './ChartTooltip.jsx'
import { seriesMax } from '../../lib/charts.js'

export default function OrdersBarChart({ series }) {
  const maxOrders = seriesMax(series, 'orders')
  const [activeIndex, setActiveIndex] = useState(null)
  const plotRef = useRef(null)
  const inView = useInView(plotRef, { once: true, amount: 0.35 })

  const barHeight = (orders) => Math.max(8, Math.round((orders / maxOrders) * 90))

  const active = activeIndex != null ? series[activeIndex] : null
  const onRight = activeIndex != null && activeIndex < series.length / 2
  const tip = active
    ? {
        label: active.label,
        value: `${active.orders.toLocaleString('en-US')} orders`,
        sub: active.revenueK != null ? `₹${active.revenueK}k revenue` : undefined,
        placement: onRight ? 'right' : 'left',
        xPct: ((onRight ? activeIndex + 1 : activeIndex) / series.length) * 100,
        yPct: Math.min(70, Math.max(26, 100 - barHeight(active.orders) * 0.8)),
      }
    : null

  return (
    <ChartPanel
      title="Sales analytics"
      legend={
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gradient-to-b from-[#f0a574] to-copper-dark" aria-hidden="true" />
          Daily volume
        </span>
      }
    >
      <div
        ref={plotRef}
        className="chart-plot relative grid h-full min-h-[12rem] flex-1 grid-cols-7 items-end gap-1.5 rounded-xl bg-gradient-to-b from-sand/35 to-transparent px-2 pb-2 pt-8 sm:gap-2 sm:px-3"
        role="img"
        aria-label="Daily orders bar chart"
        onMouseLeave={() => setActiveIndex(null)}
      >
        <ChartTooltip tip={tip} />
        {series.map((row, index) => {
          const height = barHeight(row.orders)
          const isPeak = row.orders === maxOrders
          const isActive = activeIndex === index
          return (
            <div
              key={row.label}
              className="flex h-full min-w-0 cursor-pointer flex-col items-center justify-end gap-2"
              onMouseEnter={() => setActiveIndex(index)}
            >
              <motion.span
                className={`text-[0.6rem] font-bold tabular-nums sm:text-xs ${isActive || isPeak ? 'text-copper' : 'text-transparent'}`}
                initial={{ opacity: 0, y: 6 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                transition={{ duration: 0.35, delay: 0.45 + index * 0.07 }}
              >
                {row.orders}
              </motion.span>
              <div className="bg-line/30 relative flex w-full flex-1 items-end justify-center rounded-lg">
                <motion.div
                  className={`relative w-[78%] max-w-14 origin-bottom rounded-t-lg shadow-[0_-8px_20px_rgba(196,92,38,0.25)] ${isPeak || isActive ? 'ring-copper/40 ring-2' : 'opacity-90 hover:opacity-100'}`}
                  style={{
                    height: `${height}%`,
                    background: 'linear-gradient(180deg, #f0a574 0%, #c45c26 42%, #8d3e12 100%)',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: inView ? 1 : 0, scaleX: isActive ? 1.04 : 1 }}
                  transition={{
                    scaleY: { duration: 0.75, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] },
                    scaleX: { duration: 0.18 },
                  }}
                >
                  <div
                    className="absolute inset-x-1 top-1 h-1 rounded-full bg-white/35"
                    aria-hidden="true"
                  />
                </motion.div>
              </div>
              <span
                className={`text-[0.65rem] font-bold sm:text-xs ${isActive || isPeak ? 'text-ink' : 'text-muted'}`}
              >
                {row.label}
              </span>
            </div>
          )
        })}
      </div>
    </ChartPanel>
  )
}
