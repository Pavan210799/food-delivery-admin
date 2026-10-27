import { motion, useInView } from 'framer-motion'
import { useId, useRef, useState } from 'react'
import ChartPanel from './ChartPanel.jsx'
import { donutSlicePath } from '../../lib/donut.js'

const CX = 120
const CY = 120
const OUTER = 88
const INNER = 56
const OUTER_ACTIVE = 98
const RING_INNER = 103
const RING_OUTER = 107

const growTransition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
const resetTransition = { duration: 0.06, ease: 'linear' }

export default function OrderStatusDonut({ slices }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  const [activeId, setActiveId] = useState(null)
  const chartRef = useRef(null)
  const inView = useInView(chartRef, { once: true, amount: 0.4 })
  const maskId = `donut-sweep-${useId().replace(/:/g, '')}`

  const arcs = slices.map((slice, i) => {
    const start = (slices.slice(0, i).reduce((sum, s) => sum + s.value, 0) / total) * 360
    const end = start + (slice.value / total) * 360
    return {
      ...slice,
      path: donutSlicePath(CX, CY, OUTER, INNER, start, end),
      activePath: donutSlicePath(CX, CY, OUTER_ACTIVE, INNER, start, end),
      ringPath: donutSlicePath(CX, CY, RING_OUTER, RING_INNER, start + 1, end - 1),
    }
  })

  const hovered = activeId != null ? arcs.find((a) => a.id === activeId) : null
  const shown = hovered ?? arcs[0]

  return (
    <ChartPanel
      title="Order mix"
      className="order-mix-panel min-w-0"
      overflowVisible
      legend={
        <span className="text-muted tabular-nums">
          <span className="text-ink font-bold">{total}%</span> tracked
        </span>
      }
    >
      <div
        className="order-mix-body chart-plot relative flex min-h-[12rem] flex-1 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-sand/30 via-transparent to-sage/[0.06] p-3"
        onMouseLeave={() => setActiveId(null)}
      >
        <div className="order-mix-cluster flex w-full min-w-0 flex-col items-center justify-center gap-4">
          <div ref={chartRef} className="order-mix-chart relative shrink-0">
            <svg
              viewBox="0 0 240 240"
              className="h-60 w-60 sm:h-72 sm:w-72 lg:h-60 lg:w-60 xl:h-64 xl:w-64"
              role="img"
              aria-label="Order status donut chart"
            >
              <defs>
                <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="240">
                  <g transform={`rotate(-90 ${CX} ${CY})`}>
                    <motion.circle
                      cx={CX}
                      cy={CY}
                      r="80"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="62"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: inView ? 1 : 0 }}
                      transition={{ duration: 1.15, ease: [0.65, 0, 0.35, 1] }}
                    />
                  </g>
                </mask>
              </defs>
              <circle cx={CX} cy={CY} r={OUTER + 5} fill="none" stroke="#ebe2d4" strokeWidth="1" opacity="0.6" />
              <g mask={`url(#${maskId})`}>
              {arcs.map((arc) => {
                const isHovered = activeId === arc.id
                const isDimmed = activeId != null && !isHovered
                return (
                  <motion.path
                    key={arc.id}
                    initial={false}
                    animate={{ d: isHovered ? arc.activePath : arc.path, opacity: isDimmed ? 0.55 : 1 }}
                    transition={isHovered ? growTransition : resetTransition}
                    fill={`url(#${arc.gradientId})`}
                    stroke="#fbf8f4"
                    strokeWidth="2"
                    filter="url(#marlow-slice-glow)"
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveId(arc.id)}
                  />
                )
              })}
              </g>
              {hovered ? (
                <motion.path
                  key={hovered.id}
                  d={hovered.ringPath}
                  fill={hovered.color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.45 }}
                  transition={growTransition}
                  pointerEvents="none"
                />
              ) : null}
              <circle cx={CX} cy={CY} r={INNER - 4} fill="#fbf8f4" pointerEvents="none" />
              <motion.g
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.75 }}
              >
              <text
                x={CX}
                y={CY + 2}
                textAnchor="middle"
                className="font-display text-[1.9rem] font-bold"
                style={{ fontFamily: 'Syne, sans-serif', fill: hovered ? hovered.color : '#161311', transition: 'fill 150ms ease' }}
                pointerEvents="none"
              >
                {shown?.value ?? 0}%
              </text>
              <text
                x={CX}
                y={CY + 20}
                textAnchor="middle"
                className="fill-muted text-[0.7rem] font-semibold"
                style={{ fontFamily: 'Manrope, sans-serif' }}
                pointerEvents="none"
              >
                {shown?.label ?? 'Top'}
              </text>
              </motion.g>
            </svg>
          </div>
          <ul className="order-mix-legend w-full min-w-0 space-y-2">
            {slices.map((slice, i) => {
              const isActive = activeId === slice.id
              return (
                <motion.li
                  initial={{ opacity: 0, x: 14 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 14 }}
                  transition={{ duration: 0.4, delay: 0.35 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  key={slice.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-[translate,box-shadow,background-color,border-color] ${
                    isActive ? 'duration-150' : 'duration-75'
                  } ${
                    isActive ? 'translate-x-1 shadow-sm' : 'border-line bg-paper/70'
                  }`}
                  style={
                    isActive
                      ? { borderColor: `${slice.color}66`, background: `${slice.color}14` }
                      : undefined
                  }
                  onMouseEnter={() => setActiveId(slice.id)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${slice.color}, ${slice.color}99)` }}
                    />
                    <span className="truncate font-semibold">{slice.label}</span>
                  </span>
                  <span className="shrink-0 font-bold tabular-nums">{slice.value}%</span>
                </motion.li>
              )
            })}
          </ul>
        </div>
      </div>
    </ChartPanel>
  )
}
