const ease = [0.22, 1, 0.36, 1]

export const pageListVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
  exit: (direction) => ({ opacity: 0, x: direction * -18, transition: { duration: 0.14, ease: 'easeIn' } }),
}

export const pageItemVariants = {
  hidden: (direction) => ({ opacity: 0, x: direction * 28, y: 6 }),
  show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.34, ease } },
}
