import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { lockPageScroll, unlockPageScroll } from '../../lib/scrollLock.js'

const panelMotion = {
  initial: { opacity: 0, y: 28, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 420, damping: 32, mass: 0.85 },
  },
  exit: { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
}

const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
}

export default function DetailModal({ open, title, hero, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    lockPageScroll()
    window.addEventListener('keydown', onKey)
    return () => {
      unlockPageScroll()
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence mode="wait">
      {open ? (
        <div
          key="detail-modal-layer"
          className="detail-modal-root fixed inset-0 z-50 flex items-end justify-center overflow-hidden p-3 sm:items-center sm:p-6"
        >
          <motion.button
            type="button"
            className="detail-modal-backdrop absolute inset-0 bg-ink/50 backdrop-blur-md"
            aria-label="Close dialog"
            onClick={onClose}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={backdropMotion}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-modal-title"
            className={`detail-modal-panel relative flex max-h-[min(92vh,52rem)] flex-col overflow-hidden ${hero ? 'detail-modal-panel--with-hero' : ''}`}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={panelMotion}
          >
            {hero ? <div className="detail-modal-hero-slot shrink-0">{hero}</div> : null}

            {title ? (
              <div
                className={`detail-modal-header flex shrink-0 items-start justify-between gap-3 ${hero ? 'detail-modal-header--below-hero' : ''}`}
              >
                <div className="min-w-0 flex-1">{title}</div>
                {!hero ? (
                  <button type="button" onClick={onClose} className="detail-modal-close shrink-0" aria-label="Close">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : null}
              </div>
            ) : null}

            {!title && !hero ? (
              <div className="detail-modal-header flex shrink-0 justify-end">
                <button type="button" onClick={onClose} className="detail-modal-close shrink-0" aria-label="Close">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ) : null}

            {hero ? (
              <button type="button" onClick={onClose} className="detail-modal-close detail-modal-close--float" aria-label="Close">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            ) : null}

            <div className="detail-modal-scroll min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
