// Time helpers — pure functions, no UI, no storage.

export function pad2(n) {
  return String(n).padStart(2, '0')
}

export function fmtClock(ts) {
  const d = new Date(ts)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function fmtDate(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function fmtDateTime(ts) {
  return `${fmtDate(ts)} ${fmtClock(ts)}`
}

export function startOfDay(ts = Date.now()) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function endOfDay(ts = Date.now()) {
  const d = new Date(ts)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

export function isSameDay(a, b) {
  return startOfDay(a) === startOfDay(b)
}

export function daysAgo(n) {
  return startOfDay(Date.now()) - n * 86400000
}

export function dayOfWeekLabel(ts) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(ts).getDay()]
}

export function hourOfDay(ts) {
  return new Date(ts).getHours()
}

// Buckets a timestamp into a part of day, used for the Event Distribution chart.
export function dayPart(ts) {
  const h = hourOfDay(ts)
  if (h < 11) return 'Morning'
  if (h < 14) return 'Midday'
  if (h < 18) return 'Afternoon'
  return 'Evening'
}

// Parses "HH:MM" into minutes-since-midnight for scheduling check-ins.
export function parseHHMM(str) {
  const [h, m] = str.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function minutesNowSinceMidnight() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

export function nextCheckIn(times, now = minutesNowSinceMidnight()) {
  const sorted = [...times].sort((a, b) => parseHHMM(a) - parseHHMM(b))
  for (const t of sorted) {
    if (parseHHMM(t) >= now) return t
  }
  return sorted[0] ? `${sorted[0]} (tomorrow)` : null
}
