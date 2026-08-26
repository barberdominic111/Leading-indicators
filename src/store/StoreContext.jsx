import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { loadData, saveData, newId } from './db'
import { buildFmea } from '../utils/fmea'
import { buildPareto, buildHeatmap, buildDistribution, buildRollingTrend } from '../utils/stats'
import { fmtDate } from '../utils/time'
import { DEFAULT_PROJECT_BALANCE } from '../utils/balance'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => loadData())

  useEffect(() => {
    saveData(data)
  }, [data])

  // ---- Tiles ----
  const addTile = useCallback((tile) => {
    setData((d) => ({ ...d, tiles: [...d.tiles, { id: newId('tile'), active: true, ...tile }] }))
  }, [])

  const updateTile = useCallback((id, patch) => {
    setData((d) => ({ ...d, tiles: d.tiles.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
  }, [])

  const deleteTile = useCallback((id) => {
    setData((d) => ({ ...d, tiles: d.tiles.filter((t) => t.id !== id) }))
  }, [])

  const moveTile = useCallback((id, direction) => {
    setData((d) => {
      const idx = d.tiles.findIndex((t) => t.id === id)
      const newIdx = idx + direction
      if (idx === -1 || newIdx < 0 || newIdx >= d.tiles.length) return d
      const tiles = [...d.tiles]
      const [moved] = tiles.splice(idx, 1)
      tiles.splice(newIdx, 0, moved)
      return { ...d, tiles }
    })
  }, [])

  // ---- Observations ----
  const addObservation = useCallback((eventId, extra = {}) => {
    const id = newId('obs')
    setData((d) => ({
      ...d,
      observations: [
        ...d.observations,
        {
          id,
          timestamp: Date.now(),
          eventId,
          note: extra.note || '',
          project: extra.project || d.settings.activeProjectId || '',
          customer: extra.customer || '',
          severity: extra.severity ?? null
        }
      ]
    }))
    return id
  }, [])

  const addObservationsBatch = useCallback((eventIds, extra = {}) => {
    setData((d) => {
      const now = Date.now()
      const created = eventIds.map((eventId) => ({
        id: newId('obs'),
        timestamp: now,
        eventId,
        note: extra.note || '',
        project: extra.project || d.settings.activeProjectId || '',
        customer: extra.customer || '',
        severity: null
      }))
      return { ...d, observations: [...d.observations, ...created] }
    })
  }, [])

  // Same as addObservationsBatch, but accepts { eventId: count } so a
  // single check-in can log an event more than once (e.g. it happened
  // three times since the last check-in).
  const addObservationsByCount = useCallback((countsMap, extra = {}) => {
    setData((d) => {
      const now = Date.now()
      const created = []
      Object.entries(countsMap).forEach(([eventId, count]) => {
        for (let i = 0; i < count; i++) {
          created.push({
            id: newId('obs'),
            timestamp: now,
            eventId,
            note: extra.note || '',
            project: extra.project || d.settings.activeProjectId || '',
            customer: extra.customer || '',
            severity: null
          })
        }
      })
      return { ...d, observations: [...d.observations, ...created] }
    })
  }, [])

  const deleteObservation = useCallback((id) => {
    setData((d) => ({ ...d, observations: d.observations.filter((o) => o.id !== id) }))
  }, [])

  // ---- Projects ----
  const addProject = useCallback((name) => {
    setData((d) => ({
      ...d,
      projects: [...d.projects, { id: newId('proj'), name, ...DEFAULT_PROJECT_BALANCE }]
    }))
  }, [])

  // Adds many projects at once (paste or file import), skipping names that
  // already exist (case-insensitive) so re-importing the same list is safe.
  const importProjects = useCallback((names) => {
    setData((d) => {
      const existing = new Set(d.projects.map((p) => p.name.trim().toLowerCase()))
      const toAdd = []
      names.forEach((raw) => {
        const name = raw.trim()
        if (!name) return
        const key = name.toLowerCase()
        if (existing.has(key)) return
        existing.add(key)
        toAdd.push({ id: newId('proj'), name, ...DEFAULT_PROJECT_BALANCE })
      })
      return { ...d, projects: [...d.projects, ...toAdd] }
    })
  }, [])

  const updateProject = useCallback((id, patch) => {
    setData((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
  }, [])

  const deleteProject = useCallback((id) => {
    setData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }))
  }, [])

  // ---- Completion types & records ----
  // "Completions" are the larger units of finished work a check-in reports
  // separately from raw event taps — e.g. "10 finished goods" — so the
  // count of taps and the count of things actually finished can differ.
  const addCompletionType = useCallback((name, id) => {
    setData((d) => {
      const trimmed = name.trim()
      if (!trimmed) return d
      const exists = d.completionTypes.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
      if (exists) return d
      return { ...d, completionTypes: [...d.completionTypes, { id: id || newId('ctype'), name: trimmed }] }
    })
  }, [])

  const updateCompletionType = useCallback((id, patch) => {
    setData((d) => ({ ...d, completionTypes: d.completionTypes.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
  }, [])

  const deleteCompletionType = useCallback((id) => {
    setData((d) => ({ ...d, completionTypes: d.completionTypes.filter((c) => c.id !== id) }))
  }, [])

  // quantitiesMap: { completionTypeId: quantity }
  const addCompletionsByQuantity = useCallback((quantitiesMap, extra = {}) => {
    setData((d) => {
      const now = Date.now()
      const created = Object.entries(quantitiesMap)
        .filter(([, qty]) => qty > 0)
        .map(([completionTypeId, quantity]) => ({
          id: newId('comp'),
          timestamp: now,
          completionTypeId,
          quantity,
          note: extra.note || '',
          project: extra.project || d.settings.activeProjectId || ''
        }))
      return { ...d, completions: [...d.completions, ...created] }
    })
  }, [])

  // ---- Settings ----
  const updateSettings = useCallback((patch) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  }, [])

  const setSeverity = useCallback((tileId, severity) => {
    setData((d) => ({
      ...d,
      settings: { ...d.settings, severityByTile: { ...d.settings.severityByTile, [tileId]: severity } }
    }))
  }, [])

  const setDetection = useCallback((tileId, detection) => {
    setData((d) => ({
      ...d,
      settings: { ...d.settings, detectionByTile: { ...d.settings.detectionByTile, [tileId]: detection } }
    }))
  }, [])

  // 'positive' | 'negative' | null (neutral — doesn't count toward any
  // project's balance). This is a global, per-tile setting, set on the
  // FMEA card, independent of which project happens to be active.
  const setPolarity = useCallback((tileId, polarity) => {
    setData((d) => ({
      ...d,
      settings: { ...d.settings, polarityByTile: { ...d.settings.polarityByTile, [tileId]: polarity } }
    }))
  }, [])

  const updateScales = useCallback((category, scale) => {
    setData((d) => ({
      ...d,
      settings: { ...d.settings, scales: { ...d.settings.scales, [category]: scale } }
    }))
  }, [])

  const markCheckInHandled = useCallback((time) => {
    setData((d) => {
      const today = fmtDate(Date.now())
      const existing = d.settings.lastCheckInHandled[today] || []
      if (existing.includes(time)) return d
      return {
        ...d,
        settings: {
          ...d.settings,
          lastCheckInHandled: { ...d.settings.lastCheckInHandled, [today]: [...existing, time] }
        }
      }
    })
  }, [])

  const replaceAll = useCallback((next) => setData(next), [])

  // ---- Derived selectors ----
  const fmeaRows = useMemo(
    () =>
      buildFmea(
        data.tiles,
        data.observations,
        data.settings.severityByTile,
        data.settings.detectionByTile,
        data.settings.detectionConfig,
        data.settings.scales,
        data.settings.polarityByTile
      ),
    [
      data.tiles,
      data.observations,
      data.settings.severityByTile,
      data.settings.detectionByTile,
      data.settings.detectionConfig,
      data.settings.scales,
      data.settings.polarityByTile
    ]
  )

  const filterByProject = useCallback(
    (observations, projectId) => (projectId ? observations.filter((o) => o.project === projectId) : observations),
    []
  )

  const fmeaByTileId = useMemo(() => {
    const map = {}
    fmeaRows.forEach((r) => {
      map[r.tileId] = r
    })
    return map
  }, [fmeaRows])

  const value = {
    tiles: data.tiles,
    observations: data.observations,
    projects: data.projects,
    completionTypes: data.completionTypes,
    completions: data.completions,
    settings: data.settings,
    fmeaRows,
    fmeaByTileId,
    addTile,
    updateTile,
    deleteTile,
    moveTile,
    addObservation,
    addObservationsBatch,
    addObservationsByCount,
    deleteObservation,
    addProject,
    importProjects,
    updateProject,
    deleteProject,
    addCompletionType,
    updateCompletionType,
    deleteCompletionType,
    addCompletionsByQuantity,
    updateSettings,
    setSeverity,
    setDetection,
    setPolarity,
    updateScales,
    markCheckInHandled,
    filterByProject,
    replaceAll,
    // chart builders exposed so components stay declarative
    buildPareto,
    buildHeatmap,
    buildDistribution,
    buildRollingTrend
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
