import { platformMeta } from '../data/platformData.js'

export function formatMoney(amount) {
  const value = Number(amount)
  if (platformMeta.currency === 'USD') {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
  }
  return `₹${value.toLocaleString('en-IN')}`
}
