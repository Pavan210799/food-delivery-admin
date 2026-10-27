import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const ToastContext = createContext(() => {})

const toneClass = {
  success: 'toast--success',
  info: 'toast--info',
  danger: 'toast--danger',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
  }, [])

  const notify = useCallback(
    (message, tone = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 3200),
      )
    },
    [dismiss],
  )

  const value = useMemo(() => notify, [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <div className="toast-stack" aria-live="polite" role="status">
              <AnimatePresence initial={false}>
                {toasts.map((toast) => (
                  <motion.div
                    key={toast.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.16 } }}
                    transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                    className={`toast ${toneClass[toast.tone] ?? toneClass.success}`}
                  >
                    <span className="toast-dot" aria-hidden="true" />
                    <p className="min-w-0 flex-1 text-sm font-semibold break-words">{toast.message}</p>
                    <button type="button" className="toast-close" aria-label="Dismiss" onClick={() => dismiss(toast.id)}>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
