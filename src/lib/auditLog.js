import { getSession } from './auth.js'
import { readLocalStorageJson, writeLocalStorageJson } from './localStorageJson.js'
import { STORAGE_PREFIX } from './usePersistentState.js'

const AUDIT_KEY = `${STORAGE_PREFIX}audit-log`
const MAX_ENTRIES = 200

const FALLBACK_ADMIN = { name: 'Pavan A.', role: 'Super admin' }

export function currentAdmin() {
  return getSession() ?? FALLBACK_ADMIN
}

const seedEntries = [
  { id: 'au-seed-1', module: 'Restaurants', action: 'Approved kitchen', target: 'Verde Room', actor: 'Meera N.', at: '2026-10-26T18:42:00' },
  { id: 'au-seed-2', module: 'Payments', action: 'Queued settlement batch', target: 'Batch #104', actor: 'Daniel O.', at: '2026-10-26T17:05:00' },
  { id: 'au-seed-3', module: 'Offers', action: 'Created coupon', target: 'WELCOME20', actor: 'Pavan A.', at: '2026-10-26T15:20:00' },
  { id: 'au-seed-4', module: 'Settings', action: 'Updated pricing', target: 'Small-order fee', actor: 'Pavan A.', at: '2026-10-26T11:48:00' },
  { id: 'au-seed-5', module: 'Support', action: 'Resolved ticket', target: 'TK-1042', actor: 'Ana R.', at: '2026-10-25T21:10:00' },
]

export function readAuditLog() {
  const stored = readLocalStorageJson(AUDIT_KEY, null)
  return Array.isArray(stored) ? stored : seedEntries
}

export function appendAudit(module, action, target) {
  const entry = {
    id: `au-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    module,
    action,
    target,
    actor: currentAdmin().name,
    at: new Date().toISOString(),
  }
  writeLocalStorageJson(AUDIT_KEY, [entry, ...readAuditLog()].slice(0, MAX_ENTRIES))
  return entry
}
