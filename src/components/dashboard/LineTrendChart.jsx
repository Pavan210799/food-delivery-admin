import { motion, useInView } from 'framer-motion'
import { useId, useRef, useState } from 'react'
import ChartPanel from './ChartPanel.jsx'
import ChartTooltip from './ChartTooltip.jsx'
import { buildLinePoints, pointsToPolyline, seriesMax } from '../../lib/charts.js'
import { chartTones } from '../../lib/chartTheme.js'
import { formatSeriesValue } from '../../lib/chartFormat.js'

export default function LineTrendChart({
  series,
  dataKey,
  title,
  tone = 'users',
  legendExtra = null,
}) {
  const theme = chartTones[tone] ?? chartTones.users
  const width = 400
  const height = 200
  const pad = 24
  const points = buildLinePoints(series, dataKey, width, height, pad)
  const polyline = pointsToPolyline(points)
  const baseline = height - 10
  const areaPath = `M ${points[0].x} ${baseline} ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1].x} ${baseline} Z`
  const maxVal = seriesMax(series, dataKey)
  const cols = series.length
  const innerW = width - pad * 2
  const stripW = series.length > 1 ? innerW / (series.length - 1) : innerW
  const [activeIndex, setActiveIndex] = useState(null)
  const plotRef = useRef(null)
  const inView = useInView(plotRef, { once: true, amount: 0.35 })
  const clipId = `line-reveal-${useId().replace(/:/g, '')}`
  const drawSeconds = 1.1
  const [drawn, setDrawn] = useState(false)

  const activePoint = activeIndex != null ? points[activeIndex] : null
  const yPct = activePoint ? (activePoint.y / height) * 100 : 0

  const tip = activePoint
    ? {
        label: activePoint.label,
        value: formatSeriesValue(dataKey, activePoint.value),
        xPct: (activePoint.x / width) * 100,
        yPct,
        placement: yPct < 22 ? 'below' : 'above',
      }
    : null

  return (
    <ChartPanel
      title={title}
      legend={
        legendExtra ?? (
          <span className="text-muted tabular-nums">
            Peak <span className="text-ink font-bold">{formatSeriesValue(dataKey, maxVal)}</span>
          </span>
        )
      }
    >
      <div
        ref={plotRef}
        className="chart-plot relative min-h-[12rem] flex-1 rounded-xl bg-gradient-to-b from-sand/35 to-transparent p-1 pt-6"
        onMouseLeave={() => setActiveIndex(null)}
      >
        <ChartTooltip tip={tip} />
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          role="img"
          aria-label={`${title} line chart`}
          preserveAspectRatio="none"
        >
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
            <line
              key={ratio}
              x1={pad}
              x2={width - pad}
              y1={pad + (height - pad * 2) * ratio}
              y2={pad + (height - pad * 2) * ratio}
              stroke="#e3d8c9"
              strokeWidth="1"
              strokeDasharray="4 6"
              opacity="0.85"
            />
          ))}
          <defs>
            <clipPath id={clipId}>
              <motion.rect
                x="0"
                y="0"
                height={height}
                initial={{ width: 0 }}
                animate={{ width: inView ? width : 0 }}
                transition={{ duration: drawSeconds, ease: [0.45, 0, 0.2, 1] }}
              />
            </clipPath>
          </defs>
          <path d={areaPath} fill={`url(#${theme.fillId})`} clipPath={`url(#${clipId})`} />
          <motion.polyline
            points={polyline}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: inView ? 1 : 0 }}
            transition={{ duration: drawSeconds, ease: [0.45, 0, 0.2, 1] }}
            onAnimationComplete={() => inView && setDrawn(true)}
            fill="none"
            stroke={theme.stroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#marlow-line-glow)"
            opacity="0.95"
          />
          {points.map((p, index) => (
            <line
              key={`v-${p.label}`}
              x1={p.x}
              x2={p.x}
              y1={p.y}
              y2={baseline}
              stroke={theme.stroke}
              strokeWidth={activeIndex === index ? 2 : 1}
              opacity={inView ? (activeIndex == null || activeIndex === index ? 0.22 : 0.08) : 0}
              style={{ transition: `opacity 400ms ease ${inView && !drawn ? 0.2 + (index / Math.max(points.length - 1, 1)) * drawSeconds : 0}s` }}
              pointerEvents="none"
            />
          ))}
          {points.map((p, index) => (
            <rect
              key={`hit-${p.label}`}
              x={p.x - stripW / 2}
              y={pad}
              width={stripW}
              height={baseline - pad}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setActiveIndex(index)}
            />
          ))}
          {points.map((p, index) => {
            const active = activeIndex === index
            return (
              <motion.g
                key={`dot-${p.label}`}
                pointerEvents="none"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 16,
                  delay: 0.1 + (index / Math.max(points.length - 1, 1)) * drawSeconds,
                }}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? 11 : 7}
                  fill={theme.glow}
                  opacity={active ? 0.5 : 0.35}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? 7 : 5}
                  fill="#fbf8f4"
                  stroke={theme.stroke}
                  strokeWidth={active ? 3 : 2.5}
                />
                <circle cx={p.x} cy={p.y} r={active ? 3 : 2} fill={theme.stroke} />
              </motion.g>
            )
          })}
        </svg>
      </div>
      <div
        className="text-muted mt-2 grid text-center text-[0.65rem] font-bold sm:text-xs"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {series.map((row, index) => (
          <span
            key={row.label}
            className={`truncate transition-colors ${activeIndex === index ? 'text-copper' : ''}`}
          >
            {row.label}
          </span>
        ))}
      </div>
    </ChartPanel>
  )
}
