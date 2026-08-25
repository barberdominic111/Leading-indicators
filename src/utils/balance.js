// Pure calculation functions for project-level balance tracking.
// The balance number is never stored — it's always derived from
// observations + each tile's polarity, so editing severity, detection,
// or polarity later stays automatically consistent with no separate
// running total to keep in sync.

// How much one tap of a tile is worth. "Simple" = every tap counts as 1,
// matching a plain occurrence count. "Complex" = the tap is worth that
// tile's current RPN (falls back to 1 if severity hasn't been set yet,
// since RPN is null until then).
export function weightForTile(tileId, weightMode, fmeaByTileId) {
  if (weightMode === 'complex') {
    const rpn = fmeaByTileId[tileId]?.rpn
    return rpn != null ? rpn : 1
  }
  return 1
}

// Walks a project's observations in time order, skipping any tile that
// has no polarity set (neutral / untriaged tiles don't move the needle),
// and returns each counted observation with its running cumulative value.
export function computeBalancePoints(observations, projectId, polarityByTile, weightMode, fmeaByTileId, tilesById) {
  const filtered = observations.filter((o) => o.project === projectId).sort((a, b) => a.timestamp - b.timestamp)
  let running = 0
  const points = []
  filtered.forEach((o) => {
    const polarity = polarityByTile[o.eventId]
    if (polarity !== 'positive' && polarity !== 'negative') return
    const weight = weightForTile(o.eventId, weightMode, fmeaByTileId)
    const dir = polarity === 'positive' ? 1 : -1
    running += dir * weight
    points.push({
      ...o,
      cumulative: Math.round(running * 100) / 100,
      polarity,
      weight,
      tileName: tilesById[o.eventId]?.name || 'Event',
      tileColor: tilesById[o.eventId]?.color || '#999'
    })
  })
  return points
}

export function currentBalance(points) {
  return points.length ? points[points.length - 1].cumulative : 0
}

export function leaningLabel(balance, positiveLabel, negativeLabel, zone) {
  if (Math.abs(balance) <= 0.001) return 'Perfectly balanced'
  const who = balance > 0 ? positiveLabel : negativeLabel
  const outside = Math.abs(balance) > zone
  return outside ? `Leaning toward ${who} — outside comfortable range` : `Leaning toward ${who}`
}

// Resolves the pair of words a project uses for "+" and "-", covering
// both Solo (custom word pair) and Dyad (two names) modes, with a
// generic fallback for tiles/screens that aren't tied to a project yet.
export function isBalanceOn(project) {
  return !!project && (project.balanceMode === 'solo' || project.balanceMode === 'dyad')
}

export function projectLabels(project) {
  if (!project) return { positive: 'Positive', negative: 'Negative' }
  if (project.balanceMode === 'dyad') {
    return { positive: project.personAName || 'Person A', negative: project.personBName || 'Person B' }
  }
  return { positive: project.positiveLabel || 'Positive', negative: project.negativeLabel || 'Negative' }
}

export const DEFAULT_PROJECT_BALANCE = {
  balanceMode: 'off', // 'off' | 'solo' | 'dyad'
  positiveLabel: 'Energizing',
  negativeLabel: 'Draining',
  personAName: 'Person A',
  personBName: 'Person B',
  weightMode: 'simple', // 'simple' | 'complex'
  balanceZone: 3
}
