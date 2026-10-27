export function readLocalStorageJson(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null || raw === '') return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeLocalStorageJson(key, value) {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn('[admin] localStorage save failed:', error)
    return false
  }
}
