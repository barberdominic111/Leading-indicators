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

export function buildFmea(tiles, observations, severityByTile, detectionConfig) {
  return tiles
    .filter((t) => t.active !== false)
    .map((tile) => {
      const obsForTile = observations.filter((o) => o.eventId === tile.id)
      const occurrence = obsForTile.length
      const severity = severityByTile[tile.id] ?? null
      const detection = detectionScoreForTile(obsForTile, detectionConfig)
      const rpn = severity != null ? Math.round(occurrence * severity * detection * 10) / 10 : null
      return {
        tileId: tile.id,
        failureMode: tile.name,
        category: tile.category || 'Uncategorized',
        occurrence,
        severity,
        detection,
        rpn
      }
    })
    .sort((a, b) => (b.rpn ?? -1) - (a.rpn ?? -1))
}

export const DEFAULT_DETECTION_CONFIG = {
  workdayStartMin: 6 * 60,
  workdayEndMin: 18 * 60
}
