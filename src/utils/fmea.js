// FMEA is generated, not entered. Occurrence comes straight from the data.
// Detection is inferred from WHEN events are typically noticed relative to
// a configurable "workday window" — later in the day implies weaker
// detection (a higher, worse score), matching standard FMEA convention
// where 10 = cannot detect and 1 = almost certain detection.

function minutesSinceMidnight(ts) {
  const d = new Date(ts)
  return d.getHours() * 60 + d.getMinutes()
}

export function detectionScoreForTile(observations, detectionConfig) {
  const { workdayStartMin, workdayEndMin } = detectionConfig
  if (!observations.length) return 5 // neutral default, no data yet
  const span = Math.max(workdayEndMin - workdayStartMin, 1)
  const fractions = observations.map((o) => {
    const m = minutesSinceMidnight(o.timestamp)
    const clamped = Math.min(Math.max(m, workdayStartMin), workdayEndMin)
    return (clamped - workdayStartMin) / span
  })
  const avgFraction = fractions.reduce((s, f) => s + f, 0) / fractions.length
  const score = 1 + avgFraction * 9
  return Math.round(score * 10) / 10
}

// Finds the scale entry whose value is closest to a raw continuous score,
// used only to seed a sensible default before the user has clicked a tile's
// detection cell for the first time.
export function nearestScaleValue(rawValue, scale) {
  if (!scale || !scale.length) return rawValue
  let best = scale[0]
  let bestDiff = Math.abs(scale[0].value - rawValue)
  scale.forEach((entry) => {
    const diff = Math.abs(entry.value - rawValue)
    if (diff < bestDiff) {
      best = entry
      bestDiff = diff
    }
  })
  return best.value
}

// Given the currently selected value, returns the next value in the scale,
// cycling back to the first entry after the last. Scale is sorted ascending
// by value before cycling, regardless of the order it's stored in.
export function nextScaleValue(currentValue, scale) {
  if (!scale || !scale.length) return currentValue
  const sorted = [...scale].sort((a, b) => a.value - b.value)
  const idx = sorted.findIndex((entry) => entry.value === currentValue)
  const nextIdx = idx === -1 ? 0 : (idx + 1) % sorted.length
  return sorted[nextIdx].value
}

export function labelForScaleValue(value, scale) {
  if (value == null || !scale) return null
  const entry = scale.find((e) => e.value === value)
  return entry ? entry.label : null
}

export function sortFmeaRows(rows) {
  return [...rows].sort((a, b) => {
    // Rows with a real RPN (severity has been set) always outrank rows
    // that don't have one yet. Among ties — including the common case
    // where nothing has severity set yet — fall back to occurrence, so
    // "Refresh order" always has a visible effect instead of looking
    // like a no-op / broken button when RPN is still null everywhere.
    const aRpn = a.rpn ?? -Infinity
    const bRpn = b.rpn ?? -Infinity
    if (bRpn !== aRpn) return bRpn - aRpn
    return b.occurrence - a.occurrence
  })
}

export function buildFmea(tiles, observations, severityByTile, detectionByTile, detectionConfig, scales) {
  return tiles
    .filter((t) => t.active !== false)
    .map((tile) => {
      const obsForTile = observations.filter((o) => o.eventId === tile.id)
      const occurrence = obsForTile.length
      const severity = severityByTile[tile.id] ?? null
      const rawDetection = detectionScoreForTile(obsForTile, detectionConfig)
      const detection = detectionByTile[tile.id] ?? nearestScaleValue(rawDetection, scales.detection)
      const rpn = severity != null ? Math.round(occurrence * severity * detection * 10) / 10 : null
      return {
        tileId: tile.id,
        failureMode: tile.name,
        category: tile.category || 'Uncategorized',
        description: tile.description || '',
        occurrence,
        severity,
        detection,
        rpn
      }
    })
  // Not sorted here — the FMEA screen freezes display order until the
  // person explicitly refreshes, so a tap on one card can't cause another
  // card to jump underneath the next tap.
}

export const DEFAULT_DETECTION_CONFIG = {
  workdayStartMin: 6 * 60,
  workdayEndMin: 18 * 60
}
