import { readLocalStorageJson, writeLocalStorageJson } from './localStorageJson.js'

// marlow-auth:* — separate from marlow-admin:* so Settings → reset demo data doesn't log you out
const SESSION_KEY = 'marlow-auth:session'
const USERS_KEY = 'marlow-auth:users'
const RESET_KEY = 'marlow-auth:pending-reset'

export const DEMO_CODE = '246810'
export const DEMO_ACCOUNT = {
  name: 'Pavan A.',
  email: 'pavan@marlow.app',
  password: 'Marlow@2026',
  role: 'Super admin',
  photo: 'https://randomuser.me/api/portraits/men/32.jpg',
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function readUsers() {
  const stored = readLocalStorageJson(USERS_KEY, [])
  const users = Array.isArray(stored) ? stored : []
  return users.some((u) => u.email === DEMO_ACCOUNT.email) ? users : [DEMO_ACCOUNT, ...users]
}

function writeUsers(users) {
  writeLocalStorageJson(USERS_KEY, users)
}

function readSessionStorageJson(key) {
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getSession() {
  if (typeof window === 'undefined') return null
  window.localStorage.removeItem(SESSION_KEY)
  window.localStorage.removeItem('marlow-auth:remembered-user')
  const session = readSessionStorageJson(SESSION_KEY)
  return session && typeof session === 'object' && session.email ? session : null
}

function persistSession(session) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY)
  window.sessionStorage.removeItem(SESSION_KEY)
}

export async function signIn({ email, password }) {
  await delay(650)
  const user = readUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user) return { ok: false, error: 'No account for that email.' }
  if (user.password !== password) return { ok: false, error: 'Wrong password.' }
  const session = { name: user.name, email: user.email, role: user.role, photo: user.photo, signedInAt: new Date().toISOString() }
  persistSession(session)
  return { ok: true, session }
}

export async function signUp({ name, email, password, role }) {
  await delay(750)
  const users = readUsers()
  if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { ok: false, error: 'Email already registered.' }
  }
  const user = { name: name.trim(), email: email.trim(), password, role }
  writeUsers([...users, user])
  const session = { name: user.name, email: user.email, role: user.role, signedInAt: new Date().toISOString() }
  persistSession(session)
  return { ok: true, session }
}

export async function requestPasswordReset(email) {
  await delay(650)
  const user = readUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user) return { ok: false, error: 'No account for that email.' }
  window.sessionStorage.setItem(RESET_KEY, JSON.stringify({ email: user.email, verified: false }))
  return { ok: true }
}

export function getPendingReset() {
  return readSessionStorageJson(RESET_KEY)
}

export async function verifyResetCode(code) {
  await delay(500)
  const pending = getPendingReset()
  if (!pending) return { ok: false, error: 'Reset expired — request a new code.' }
  if (code !== DEMO_CODE) return { ok: false, error: 'Invalid code.' }
  window.sessionStorage.setItem(RESET_KEY, JSON.stringify({ ...pending, verified: true }))
  return { ok: true }
}

export async function resetPassword(password) {
  await delay(650)
  const pending = getPendingReset()
  if (!pending?.verified) return { ok: false, error: 'Verify the code first.' }
  const users = readUsers().map((u) => (u.email === pending.email ? { ...u, password } : u))
  writeUsers(users)
  window.sessionStorage.removeItem(RESET_KEY)
  return { ok: true, email: pending.email }
}

export function passwordStrength(password) {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: password ? labels[score] : '' }
}

export function passwordReminder(password, confirm) {
  if (password.length < 8) return 'At least 8 characters.'
  if (!/\d/.test(password) || !/[A-Za-z]/.test(password)) return 'Include a letter and a number.'
  if (confirm !== undefined && confirm !== password) return 'Passwords don’t match.'
  return ''
}
