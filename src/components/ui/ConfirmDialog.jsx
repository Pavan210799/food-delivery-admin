import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { lockPageScroll, unlockPageScroll } from '../../lib/scrollLock.js'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'copper',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    lockPageScroll()
    window.addEventListener('keydown', onKey)
    return () => {
      unlockPageScroll()
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onCancel])

  if (!open) return null

  const confirmClass =
    tone === 'danger'
      ? 'bg-danger hover:bg-danger/90 text-paper'
      : 'bg-copper hover:bg-copper-dark text-paper'

  return createPortal(
    <div className="confirm-dialog-root fixed inset-0 z-[60] flex items-center justify-center">
      <button type="button" className="absolute inset-0 bg-ink/50 backdrop-blur-[1px]" aria-label="Cancel" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="confirm-dialog-panel relative rounded-2xl border border-line bg-paper p-5 shadow-[0_24px_64px_rgba(22,19,17,0.2)]"
      >
        <h3 id="confirm-dialog-title" className="font-display text-lg font-bold tracking-tight">
          {title}
        </h3>
        <p className="text-muted mt-2 text-sm leading-relaxed break-words">{message}</p>
        <div className="confirm-dialog-actions mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="border-line bg-cream hover:bg-sand inline-flex rounded-lg border px-4 py-2 text-sm font-bold"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex rounded-lg px-4 py-2 text-sm font-bold shadow-md ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
