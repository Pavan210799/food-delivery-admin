export default function ChartSvgDefs() {
  return (
    <svg aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
      <defs>
        <linearGradient id="marlow-fill-revenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#24543c" stopOpacity="0.42" />
          <stop offset="55%" stopColor="#24543c" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#24543c" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="marlow-fill-users" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c45c26" stopOpacity="0.48" />
          <stop offset="55%" stopColor="#c45c26" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#c45c26" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="marlow-fill-orders" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8d6b32" stopOpacity="0.44" />
          <stop offset="55%" stopColor="#8d6b32" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#8d6b32" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="marlow-bar-copper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0a574" />
          <stop offset="45%" stopColor="#c45c26" />
          <stop offset="100%" stopColor="#8d3e12" />
        </linearGradient>
        <linearGradient id="marlow-bar-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4b06a" />
          <stop offset="100%" stopColor="#8d6b32" />
        </linearGradient>
        <linearGradient id="marlow-bar-revenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a9d78" />
          <stop offset="100%" stopColor="#24543c" />
        </linearGradient>
        <filter id="marlow-line-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="marlow-slice-glow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#161311" floodOpacity="0.12" />
        </filter>
        <linearGradient id="slice-sage" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3d7a5a" />
          <stop offset="100%" stopColor="#24543c" />
        </linearGradient>
        <linearGradient id="slice-copper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0a574" />
          <stop offset="100%" stopColor="#c45c26" />
        </linearGradient>
        <linearGradient id="slice-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4b06a" />
          <stop offset="100%" stopColor="#8d6b32" />
        </linearGradient>
        <linearGradient id="slice-danger" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b84a4a" />
          <stop offset="100%" stopColor="#8c2e2e" />
        </linearGradient>
        <linearGradient id="ring-copper" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f0a574" />
          <stop offset="100%" stopColor="#c45c26" />
        </linearGradient>
        <linearGradient id="ring-sage" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a9d78" />
          <stop offset="100%" stopColor="#24543c" />
        </linearGradient>
        <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4b06a" />
          <stop offset="100%" stopColor="#8d6b32" />
        </linearGradient>
        <linearGradient id="ring-copper-dark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c45c26" />
          <stop offset="100%" stopColor="#8d3e12" />
        </linearGradient>
      </defs>
    </svg>
  )
}
