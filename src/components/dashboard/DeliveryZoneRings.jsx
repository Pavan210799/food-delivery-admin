import { useState } from 'react'
import ChartPanel from './ChartPanel.jsx'
import ChartTooltip from './ChartTooltip.jsx'
import { ringStrokeLength } from '../../lib/donut.js'

export default function DeliveryZoneRings({ zones }) {
  const cx = 130
  const cy = 130
  const baseR = 96
  const step = 18
  const [activeId, setActiveId] = useState(null)

  const active = zones.find((z) => z.id === activeId)
  const tip = active
    ? {
        label: active.label,
        value: `${active.sharePct}% load`,
        sub: `${active.orders.toLocaleString('en-US')} orders today`,
        xPct: 50,
        yPct: 6,
      }
    : null

  return (
    <ChartPanel
      title="Zone load"
      legend={
        <span className="text-muted">
          Capacity <span className="text-ink font-bold">index</span>
        </span>
      }
    >
      <div
        className="chart-plot relative flex min-h-[12rem] flex-1 flex-col gap-4 rounded-xl bg-gradient-to-tr from-gold/[0.08] via-transparent to-copper/[0.05] p-3 sm:flex-row sm:items-center"
        onMouseLeave={() => setActiveId(null)}
      >
        <ChartTooltip tip={tip} />
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <svg viewBox="0 0 260 260" className="h-48 w-48" role="img" aria-label="Delivery zone radial rings">
            {zones.map((zone, index) => {
              const r = baseR - index * step
              const { dash, gap } = ringStrokeLength(r, zone.sharePct)
              const isActive = activeId == null || activeId === zone.id
              return (
                <g key={zone.id}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="#e3d8c9"
                    strokeWidth="10"
                    opacity="0.55"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={`url(#${zone.gradientId})`}
                    strokeWidth={activeId === zone.id ? 12 : 10}
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${gap}`}
                    transform={`rotate(-90 ${cx} ${cy})`}
                    filter="url(#marlow-line-glow)"
                    className="zone-ring cursor-pointer transition-all"
                    style={{
                      animationDelay: `${index * 120}ms`,
                      opacity: isActive ? 1 : 0.28,
                    }}
                    onMouseEnter={() => setActiveId(zone.id)}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="22"
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveId(zone.id)}
                  />
                </g>
              )
            })}
            <circle cx={cx} cy={cy} r={28} fill="#fbf8f4" stroke="#e3d8c9" strokeWidth="1" pointerEvents="none" />
            <text
              x={cx}
              y={cy + 5}
              textAnchor="middle"
              className="text-xs font-bold"
              fill="#c45c26"
              style={{ fontFamily: 'Manrope, sans-serif' }}
              pointerEvents="none"
            >
              {active?.label ?? '4 zones'}
            </text>
          </svg>
        </div>
        <ul className="flex flex-1 flex-col justify-center gap-2">
          {zones.map((zone) => (
            <li
              key={zone.id}
              className={`group cursor-pointer rounded-lg p-1 transition-colors ${activeId === zone.id ? 'bg-gold/10' : ''}`}
              onMouseEnter={() => setActiveId(zone.id)}
            >
              <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: zone.color, boxShadow: `0 0 8px ${zone.color}66` }}
                  />
                  {zone.label}
                </span>
                <span className="text-muted tabular-nums">
                  <span className="text-ink font-bold">{zone.sharePct}%</span>
                </span>
              </div>
              <div className="bg-line/50 h-2 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${zone.sharePct}%`,
                    background: `linear-gradient(90deg, ${zone.color}cc, ${zone.color})`,
                    boxShadow: activeId === zone.id ? `0 0 12px ${zone.color}88` : `0 0 12px ${zone.color}55`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ChartPanel>
  )
}
