export default function FilterChip({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-line max-w-full min-w-0 shrink rounded-[0.6rem] border sm:rounded-xl px-3 py-1.5 text-xs font-bold transition-colors duration-150 sm:px-4 sm:py-2 sm:text-sm ${
        active
          ? 'border-copper/40 bg-copper text-paper shadow-[0_3px_10px_rgba(196,92,38,0.25)]'
          : 'bg-paper/80 text-muted shadow-none hover:border-copper/25 hover:bg-cream hover:text-ink'
      }`}
    >
      <span className="truncate">{label}</span>
      {count != null ? (
        <span className={`ml-1.5 shrink-0 tabular-nums ${active ? 'text-paper/90' : 'text-muted'}`}>({count})</span>
      ) : null}
    </button>
  )
}
