import { dayOfWeekLabel, hourOfDay, dayPart, fmtDate, daysAgo } from './time'

// Sorts counts descending and computes cumulative %, flagging the
// bars that fall within the top-80% cumulative threshold.
export function buildPareto(items) {
  // items: [{ key, label, count, color }]
  const sorted = [...items].sort((a, b) => b.count - a.count)
  const total = sorted.reduce((s, i) => s + i.count, 0) || 1
  let cum = 0
  return sorted.map((item) => {
    cum += item.count
    const cumPct = (cum / total) * 100
    return {
      ...item,
      pct: (item.count / total) * 100,
      cumPct,
      in80: cumPct <= 80 || cum - item.count < total * 0.8
    }
  })
}

export function stdDev(arr) {
  if (!arr.length) return 0
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length
  const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length
  return Math.sqrt(variance)
}

// Day-of-week x hour-of-day matrix of observation counts.
export function buildHeatmap(observations) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const grid = days.map((d) => ({ day: d, hours: Array.from({ length: 24 }, () => 0) }))
  observations.forEach((o) => {
    const dayLabel = dayOfWeekLabel(o.timestamp)
    const h = hourOfDay(o.timestamp)
    const row = grid.find((r) => r.day === dayLabel)
    if (row) row.hours[h] += 1
  })
  return grid
}

// Morning / Midday / Afternoon / Evening histogram.
export function buildDistribution(observations) {
  const buckets = { Morning: 0, Midday: 0, Afternoon: 0, Evening: 0 }
  observations.forEach((o) => {
    buckets[dayPart(o.timestamp)] += 1
  })
  return Object.entries(buckets).map(([name, count]) => ({ name, count }))
}

// Occurrences per day for the last N days, with a 7-day moving average.
export function buildRollingTrend(observations, days = 30) {
  const counts = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = fmtDate(daysAgo(i))
    counts[d] = 0
  }
  observations.forEach((o) => {
    const d = fmtDate(o.timestamp)
    if (d in counts) counts[d] += 1
  })
  const series = Object.entries(counts).map(([date, count]) => ({ date, count }))
  return series.map((point, idx) => {
    const windowStart = Math.max(0, idx - 6)
    const window = series.slice(windowStart, idx + 1)
    const avg = window.reduce((s, p) => s + p.count, 0) / window.length
    return { ...point, movingAvg: Math.round(avg * 100) / 100 }
  })
}
