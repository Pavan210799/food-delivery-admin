import { motion } from 'framer-motion'

const splitClass = {
  '65-35': 'dashboard-split-65-35',
  '40-60': 'dashboard-split-40-60',
  '60-40': 'dashboard-split-60-40',
  '50-50': 'dashboard-split-50-50',
}

export default function DashboardRow({ ratio = '65-35', children, className = '', delay = 0 }) {
  return (
    <motion.section
      className={`${splitClass[ratio] ?? splitClass['65-35']} ${className}`}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}
