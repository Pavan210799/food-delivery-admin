let lockedScrollY = 0
let lockCount = 0

export function lockPageScroll() {
  if (typeof document === 'undefined') return
  lockCount += 1
  if (lockCount > 1) return

  lockedScrollY = window.scrollY
  document.documentElement.classList.add('modal-scroll-lock')
  document.body.classList.add('modal-scroll-lock')
  document.body.style.position = 'fixed'
  document.body.style.top = `-${lockedScrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
}

export function unlockPageScroll() {
  if (typeof document === 'undefined') return
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount > 0) return

  document.documentElement.classList.remove('modal-scroll-lock')
  document.body.classList.remove('modal-scroll-lock')
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  window.scrollTo(0, lockedScrollY)
}
