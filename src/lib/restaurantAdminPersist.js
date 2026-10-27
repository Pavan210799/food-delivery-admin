import { readLocalStorageJson, writeLocalStorageJson } from './localStorageJson.js'

export const RESTAURANT_ADMIN_STORAGE_KEY = 'marlow-admin:restaurant-module'

const PERSIST_VERSION = 1

export const DEFAULT_REGISTER_COVER =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=75'

const EMPTY = {
  addedRestaurants: [],
  addedMenuItems: [],
  stockByItemId: {},
  commissionByRestaurantId: {},
}

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function sanitizeImageUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return DEFAULT_REGISTER_COVER
  if (url.startsWith('blob:')) return DEFAULT_REGISTER_COVER
  return url.trim()
}

function sanitizeRestaurant(record) {
  if (!record || typeof record !== 'object' || typeof record.id !== 'string') return null
  return {
    ...record,
    image: sanitizeImageUrl(record.image),
  }
}

function sanitizeMenuItem(item) {
  if (!item || typeof item !== 'object') return null
  if (typeof item.id !== 'string' || typeof item.restaurantId !== 'string') return null
  if (typeof item.name !== 'string' || !item.name.trim()) return null
  const price = Number(item.price)
  if (Number.isNaN(price) || price <= 0) return null
  return {
    id: item.id,
    restaurantId: item.restaurantId,
    name: item.name.trim(),
    price,
    categoryId: typeof item.categoryId === 'string' ? item.categoryId : 'specials',
    categoryName: typeof item.categoryName === 'string' ? item.categoryName : 'Specials',
    veg: Boolean(item.veg),
    available: item.available !== false,
  }
}

function sanitizeStockMap(map) {
  const next = {}
  for (const [id, available] of Object.entries(map)) {
    if (typeof id === 'string' && id.length > 0 && typeof available === 'boolean') {
      next[id] = available
    }
  }
  return next
}

function sanitizeCommissionMap(map) {
  const next = {}
  for (const [id, pct] of Object.entries(map)) {
    const value = Number(pct)
    if (typeof id === 'string' && id.length > 0 && !Number.isNaN(value) && value >= 5 && value <= 35) {
      next[id] = value
    }
  }
  return next
}

export function normalizeRestaurantAdminPersist(raw) {
  if (!raw || typeof raw !== 'object') return { ...EMPTY }

  const restaurants = Array.isArray(raw.addedRestaurants)
    ? raw.addedRestaurants.map(sanitizeRestaurant).filter(Boolean)
    : []

  const menuItems = Array.isArray(raw.addedMenuItems)
    ? raw.addedMenuItems.map(sanitizeMenuItem).filter(Boolean)
    : []

  return {
    addedRestaurants: restaurants,
    addedMenuItems: menuItems,
    stockByItemId: isPlainObject(raw.stockByItemId) ? sanitizeStockMap(raw.stockByItemId) : {},
    commissionByRestaurantId: isPlainObject(raw.commissionByRestaurantId)
      ? sanitizeCommissionMap(raw.commissionByRestaurantId)
      : {},
  }
}

export function loadRestaurantAdminPersist() {
  const raw = readLocalStorageJson(RESTAURANT_ADMIN_STORAGE_KEY, null)
  return normalizeRestaurantAdminPersist(raw)
}

export function saveRestaurantAdminPersist(state) {
  const normalized = normalizeRestaurantAdminPersist(state)
  return writeLocalStorageJson(RESTAURANT_ADMIN_STORAGE_KEY, {
    v: PERSIST_VERSION,
    ...normalized,
  })
}
