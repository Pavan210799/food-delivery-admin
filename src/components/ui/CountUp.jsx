import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'

const NUMBER_RE = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/

function parse(text) {
  const match = text.match(NUMBER_RE)
  if (!match) return null
  const [, prefix, raw, suffix] = match
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0
  const grouped = raw.includes(',')
  return {
    target: Number(raw.replace(/,/g, '')),
    format: (n) =>
      `${prefix}${n.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: grouped,
      })}${suffix}`,
  }
}

export default function CountUp({ value, duration = 1.1, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduceMotion = useReducedMotion()
  const text = String(value)
  const parsed = reduceMotion ? null : parse(text)

  useEffect(() => {
    const el = ref.current
    const counter = parse(text)
    if (!el || !counter || !inView || reduceMotion) return undefined
    const controls = animate(0, counter.target, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => {
        el.textContent = counter.format(n)
      },
      onComplete: () => {
        el.textContent = text
      },
    })
    return () => controls.stop()
  }, [inView, reduceMotion, text, duration, delay])

  return (
    <span ref={ref} className={className} aria-label={text}>
      {parsed ? parsed.format(0) : text}
    </span>
  )
}
