import { useEffect, useState } from 'react'
import { readLocalStorageJson, writeLocalStorageJson } from './localStorageJson.js'

export const STORAGE_PREFIX = 'marlow-admin:'

function resolveInitial(initialValue) {
  return typeof initialValue === 'function' ? initialValue() : initialValue
}

function sameShape(stored, fallback) {
  if (Array.isArray(fallback)) return Array.isArray(stored)
  if (fallback !== null && typeof fallback === 'object') {
    return stored !== null && typeof stored === 'object' && !Array.isArray(stored)
  }
  return typeof stored === typeof fallback
}

/** `useState` that survives reloads. Falls back to the seed when storage is empty or malformed. */
export function usePersistentState(key, initialValue) {
  const storageKey = `${STORAGE_PREFIX}${key}`
  const [value, setValue] = useState(() => {
    const fallback = resolveInitial(initialValue)
    const stored = readLocalStorageJson(storageKey, undefined)
    if (stored === undefined || !sameShape(stored, fallback)) return fallback
    if (fallback !== null && typeof fallback === 'object' && !Array.isArray(fallback)) {
      return { ...fallback, ...stored }
    }
    return stored
  })

  useEffect(() => {
    writeLocalStorageJson(storageKey, value)
  }, [storageKey, value])

  return [value, setValue]
}

export function clearAdminStorage() {
  if (typeof window === 'undefined') return
  const keys = []
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i)
    if (key?.startsWith(STORAGE_PREFIX)) keys.push(key)
  }
  keys.forEach((key) => window.localStorage.removeItem(key))
}
