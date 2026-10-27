export default function Logo({ className = '', markClassName = 'h-9 w-9', showAdmin = true, tone = 'dark' }) {
  const light = tone === 'light'
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 64 64" className={`shrink-0 ${markClassName}`} aria-hidden="true">
        <rect width="64" height="64" rx="18" fill={light ? '#FBF8F4' : '#161311'} />
        <path
          d="M18 44V20.5L32 34.2 46 20.5V44"
          fill="none"
          stroke={light ? '#161311' : '#F3EEE6'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="16" r="3.2" fill="#C45C26" />
      </svg>
      <span className="min-w-0">
        <span className="font-display block text-lg leading-none font-bold tracking-tight">Marlow</span>
        {showAdmin ? (
          <span
            className={`mt-0.5 block text-[0.65rem] font-semibold tracking-[0.14em] uppercase ${light ? 'text-paper/70' : 'text-muted'}`}
          >
            Admin
          </span>
        ) : null}
      </span>
    </span>
  )
}
