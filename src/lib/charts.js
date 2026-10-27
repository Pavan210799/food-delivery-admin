export function seriesMax(series, key) {
  return series.reduce((max, row) => Math.max(max, Number(row[key]) || 0), 0) || 1
}

export function seriesMin(series, key) {
  return series.reduce((min, row) => Math.min(min, Number(row[key]) || 0), Infinity)
}

export function buildLinePoints(series, key, width, height, padding = 16) {
  const max = seriesMax(series, key)
  const min = Math.min(seriesMin(series, key), 0)
  const range = max - min || 1
  const innerW = width - padding * 2
  const innerH = height - padding * 2
  const step = series.length > 1 ? innerW / (series.length - 1) : 0

  return series.map((row, index) => {
    const value = Number(row[key]) || 0
    const x = padding + index * step
    const y = padding + innerH - ((value - min) / range) * innerH
    return { x, y, value, label: row.label }
  })
}

export function pointsToPolyline(points) {
  return points.map((p) => `${p.x},${p.y}`).join(' ')
}
