import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const FIRST_LOAD_MS = 1100
const NAVIGATION_MS = 550
let hasBooted = false

export function PageLoader({ skeleton, children }) {
  const { pathname } = useLocation()
  const [readyPath, setReadyPath] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const timer = setTimeout(
      () => {
        hasBooted = true
        setReadyPath(pathname)
      },
      hasBooted ? NAVIGATION_MS : FIRST_LOAD_MS,
    )
    return () => clearTimeout(timer)
  }, [pathname])

  return readyPath === pathname ? children : skeleton
}

export function LazySection({ skeleton, children, delay = 450 }) {
  const ref = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let firstCallback = true
    let timer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          if (firstCallback) setReady(true)
          else timer = setTimeout(() => setReady(true), delay)
        }
        firstCallback = false
      },
      { rootMargin: '0px 0px -48px 0px' },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [delay])

  return (
    <div ref={ref} className="min-w-0">
      {ready ? children : skeleton}
    </div>
  )
}
