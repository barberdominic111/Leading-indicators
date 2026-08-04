// Persistence layer. Nothing here knows about React — it is pure
// read/write against localStorage so the app can later swap in
// Firebase without touching any component.

import { DEFAULT_DETECTION_CONFIG } from '../utils/fmea'

const KEY = 'li_app_data_v1'

const DEFAULT_TILES = [
  { id: 'customer_complaint', name: 'Customer complaint', color: '#AD5B45', category: 'Quality', active: true },
  { id: 'quotation_sent', name: 'Quotation sent', color: '#B5764B', category: 'Sales', active: true },
  { id: 'machine_adjusted', name: 'Machine adjusted', color: '#8A7A9B', category: 'Operations', active: true },
  { id: 'operator_coached', name: 'Operator coached', color: '#6B8F71', category: 'People', active: true },
  { id: 'bathroom_break', name: 'Bathroom break', color: '#9C9892', category: 'Rest', active: true },
  { id: 'coffee_break', name: 'Coffee break', color: '#B98A2E', category: 'Rest', active: true },
  { id: 'safety_concern', name: 'Safety concern', color: '#AD5B45', category: 'Safety', active: true },
  { id: 'quality_check', name: 'Quality check', color: '#4C6B8A', category: 'Quality', active: true },
  { id: 'email_answered', name: 'Email answered', color: '#7A8CA3', category: 'Admin', active: true },
  { id: 'project_updated', name: 'Project updated', color: '#6B8F71', category: 'Admin', active: true }
]

const DEFAULT_SCALES = {
  severity: [
    { value: 1, label: 'Minor' },
    { value: 5, label: 'Moderate' },
    { value: 10, label: 'Critical' }
  ],
  detection: [
    { value: 1, label: 'Consistent' },
    { value: 5, label: 'Predictable' },
    { value: 10, label: 'Surprise' }
  ]
}

const DEFAULT_DATA = {
  tiles: DEFAULT_TILES,
  observations: [],
  projects: [],
  settings: {
    checkinTimes: ['08:00', '10:00', '12:00', '14:00', '16:00'],
    detectionConfig: DEFAULT_DETECTION_CONFIG,
    activeProjectId: null,
    severityByTile: {},
    detectionByTile: {},
    scales: DEFAULT_SCALES,
    lastCheckInHandled: {} // { "2026-08-03": ["08:00", "10:00"] }
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredCloneSafe(DEFAULT_DATA)
    const parsed = JSON.parse(raw)
    // Shallow-merge so new fields introduced in later versions don't crash old data.
    return {
      ...structuredCloneSafe(DEFAULT_DATA),
      ...parsed,
      settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) }
    }
  } catch {
    return structuredCloneSafe(DEFAULT_DATA)
  }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

function structuredCloneSafe(obj) {
  return typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj))
}

export function newId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
