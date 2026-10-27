import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { findNavItem } from '../../config/navigation.js'
import { useAuth } from '../../lib/authContext.js'
import Avatar from '../ui/Avatar.jsx'
import { useToast } from '../ui/Toast.jsx'

function UserMenu() {
  const { session, signOut } = useAuth()
  const notify = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!session) return null

  const handleSignOut = () => {
    setOpen(false)
    navigate('/login', { replace: true })
    signOut()
    notify('You’ve been signed out', 'info')
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="user-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar name={session.name} photo={session.photo} />
        <span className="hidden min-w-0 text-left leading-tight sm:block">
          <span className="block max-w-[9rem] truncate text-sm font-bold">{session.name}</span>
          <span className="text-muted block max-w-[9rem] truncate text-xs font-semibold">{session.role}</span>
        </span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            className="user-menu-panel"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="user-menu-head">
              <Avatar name={session.name} photo={session.photo} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{session.name}</p>
                <p className="text-muted truncate text-xs font-semibold">{session.email}</p>
                <span className="text-copper-dark mt-1 inline-block text-[0.65rem] font-extrabold tracking-[0.1em] uppercase">
                  {session.role}
                </span>
              </div>
            </div>
            <div className="p-1.5">
              <Link to="/settings" role="menuitem" className="user-menu-item" onClick={() => setOpen(false)}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                Settings
              </Link>
              <button type="button" role="menuitem" className="user-menu-item user-menu-item--danger" onClick={handleSignOut}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <path
                    d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Sign out
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default function TopBar({ onOpenNav }) {
  const { pathname } = useLocation()
  const active = findNavItem(pathname)

  return (
    <header className="border-line bg-paper/90 sticky top-0 z-20 flex items-center justify-between gap-4 border-b px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="border-line text-ink hover:bg-sand inline-flex h-10 w-10 items-center justify-center rounded-lg border lg:hidden"
          aria-label="Open navigation"
          onClick={onOpenNav}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{active.label}</h1>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <UserMenu />
      </div>
    </header>
  )
}
