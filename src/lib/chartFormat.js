export function formatSeriesValue(dataKey, value) {
  if (dataKey === 'revenueK') return `$${value}k`
  if (dataKey === 'orders') return `${value.toLocaleString('en-US')} orders`
  if (dataKey === 'users') return `${value.toLocaleString('en-US')} users`
  return String(value)
}
