const toneClass = {
  sage: 'bg-sage/12 text-sage border-sage/25',
  copper: 'bg-copper/12 text-copper-dark border-copper/25',
  gold: 'bg-gold/12 text-gold border-gold/25',
  danger: 'bg-danger/10 text-danger border-danger/20',
  muted: 'bg-sand text-muted border-line',
}

export default function StatusBadge({ label, tone = 'muted', onPhoto = false }) {
  if (onPhoto) {
    return (
      <span className={`status-badge status-badge--on-photo status-badge--on-photo-${tone}`}>
        <span className="truncate">{label}</span>
      </span>
    )
  }

  return (
    <span
      className={`status-badge inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-extrabold tracking-wide whitespace-nowrap uppercase sm:text-xs ${toneClass[tone] ?? toneClass.muted}`}
    >
      <span className="truncate">{label}</span>
    </span>
  )
}
