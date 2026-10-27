const TAU = Math.PI * 2

export function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function donutSlicePath(cx, cy, outerR, innerR, startDeg, endDeg) {
  const span = endDeg - startDeg
  if (span >= 360) {
    return [
      `M ${cx} ${cy - outerR}`,
      `A ${outerR} ${outerR} 0 1 1 ${cx - 0.01} ${cy - outerR}`,
      `M ${cx} ${cy - innerR}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx + 0.01} ${cy - innerR}`,
    ].join(' ')
  }
  const large = span > 180 ? 1 : 0
  const oStart = polar(cx, cy, outerR, startDeg)
  const oEnd = polar(cx, cy, outerR, endDeg)
  const iEnd = polar(cx, cy, innerR, endDeg)
  const iStart = polar(cx, cy, innerR, startDeg)
  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${iStart.x} ${iStart.y}`,
    'Z',
  ].join(' ')
}

export function ringStrokeLength(r, pct) {
  const c = TAU * r
  return { dash: (pct / 100) * c, gap: c }
}
