import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { loadData, saveData, newId } from './db'
import { buildFmea } from '../utils/fmea'
import { buildPareto, buildHeatmap, buildDistribution, buildRollingTrend } from '../utils/stats'
import { fmtDate } from '../utils/time'

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

  // ---- Observations ----
  const addObservation = useCallback((eventId, extra = {}) => {
    setData((d) => ({
      ...d,
      observations: [
        ...d.observations,
        {
          id: newId('obs'),
          timestamp: Date.now(),
          eventId,
          note: extra.note || '',
          project: extra.project || d.settings.activeProjectId || '',
          customer: extra.customer || '',
          severity: extra.severity ?? null
        }
      ]
    }))
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
    setData((d) => ({ ...d, projects: [...d.projects, { id: newId('proj'), name }] }))
  }, [])

  const updateProject = useCallback((id, patch) => {
    setData((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
  }, [])

  const deleteProject = useCallback((id) => {
    setData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }))
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
        data.settings.scales
      ),
    [
      data.tiles,
      data.observations,
      data.settings.severityByTile,
      data.settings.detectionByTile,
      data.settings.detectionConfig,
      data.settings.scales
    ]
  )

  const filterByProject = useCallback(
    (observations, projectId) => (projectId ? observations.filter((o) => o.project === projectId) : observations),
    []
  )

  const value = {
    tiles: data.tiles,
    observations: data.observations,
    projects: data.projects,
    settings: data.settings,
    fmeaRows,
    addTile,
    updateTile,
    deleteTile,
    addObservation,
    addObservationsBatch,
    addObservationsByCount,
    deleteObservation,
    addProject,
    updateProject,
    deleteProject,
    updateSettings,
    setSeverity,
    setDetection,
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
