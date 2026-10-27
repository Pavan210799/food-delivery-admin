import { motion } from 'framer-motion'

const fills = {
  copper: 'linear-gradient(90deg, #f0a574, #c45c26)',
  sage: 'linear-gradient(90deg, #5a9d78, #24543c)',
  gold: 'linear-gradient(90deg, #d4b06a, #8d6b32)',
  danger: 'linear-gradient(90deg, #b84a4a, #8c2e2e)',
}

export default function ProgressBar({ value, tone = 'copper', className = '' }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={`bg-line/50 h-2 overflow-hidden rounded-full ${className}`}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: fills[tone] ?? fills.copper }}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
