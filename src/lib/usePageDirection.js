import { useRef } from 'react'

export function usePageDirection(page) {
  const prev = useRef(page)
  const dir = useRef(1)
  if (page !== prev.current) {
    dir.current = page > prev.current ? 1 : -1
    prev.current = page
  }
  return dir.current
}
