import { deliveryPartners } from '../data/platformData.js'
import { readLocalStorageJson } from './localStorageJson.js'
import { STORAGE_PREFIX } from './usePersistentState.js'

export const PARTNER_ASSIGNMENTS_KEY = 'partners-assignments'
export const PARTNERS_ADDED_KEY = 'partners-added'

/** Order → partner assignments made in the Delivery Partners module, readable from any page. */
export function readPartnerAssignments() {
  const stored = readLocalStorageJson(`${STORAGE_PREFIX}${PARTNER_ASSIGNMENTS_KEY}`, {})
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
}

export function readAllPartners() {
  const added = readLocalStorageJson(`${STORAGE_PREFIX}${PARTNERS_ADDED_KEY}`, [])
  return [...(Array.isArray(added) ? added : []), ...deliveryPartners]
}
