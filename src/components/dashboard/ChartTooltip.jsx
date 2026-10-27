export default function ChartTooltip({ tip }) {
  if (!tip) return null

  const placement = tip.placement ?? ((tip.yPct ?? 0) < 22 ? 'below' : 'above')
  const align = tip.align ?? (tip.xPct < 18 ? 'start' : tip.xPct > 82 ? 'end' : 'center')
  let translateX =
    align === 'start' ? '-0.75rem' : align === 'end' ? 'calc(-100% + 0.75rem)' : '-50%'
  let translateY =
    placement === 'below' ? '0.35rem' : 'calc(-100% - 0.65rem)'

  if (placement === 'right' || placement === 'left') {
    translateX = placement === 'right' ? '0.375rem' : 'calc(-100% - 0.375rem)'
    translateY = '-50%'
  }

  return (
    <div
      className="chart-tooltip pointer-events-none absolute z-20"
      style={{
        left: `${tip.xPct}%`,
        top: `${tip.yPct}%`,
        transform: `translate(${translateX}, ${translateY})`,
      }}
      role="status"
      aria-live="polite"
    >
      {tip.label ? (
        <p className="text-muted text-[0.65rem] font-bold tracking-wide uppercase">{tip.label}</p>
      ) : null}
      <p className="text-ink font-display text-sm font-bold tabular-nums whitespace-nowrap">{tip.value}</p>
      {tip.sub ? (
        <p className="text-muted mt-0.5 text-[0.65rem] font-semibold whitespace-nowrap">{tip.sub}</p>
      ) : null}
    </div>
  )
}
