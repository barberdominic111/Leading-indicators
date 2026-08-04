import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { buildPareto, buildHeatmap, buildDistribution, buildRollingTrend } from '../utils/stats'
import Pareto from './charts/Pareto.jsx'
import HeatMap from './charts/HeatMap.jsx'
import Distribution from './charts/Distribution.jsx'
import RollingTrend from './charts/RollingTrend.jsx'

const SUBTABS = [
  { key: 'pareto', label: 'Pareto' },
  { key: 'heatmap', label: 'Heat Map' },
  { key: 'distribution', label: 'Distribution' },
  { key: 'trend', label: 'Rolling Trend' }
]

export default function Charts() {
  const store = useStore()
  const [sub, setSub] = useState('pareto')
  const [projectFilter, setProjectFilter] = useState('')

  const filteredObs = useMemo(
    () => (projectFilter ? store.observations.filter((o) => o.project === projectFilter) : store.observations),
    [store.observations, projectFilter]
  )

  const paretoData = useMemo(
    () =>
      buildPareto(
        store.tiles
          .filter((t) => t.active !== false)
          .map((t) => ({
            key: t.id,
            label: t.name,
            count: filteredObs.filter((o) => o.eventId === t.id).length
          }))
      ),
    [store.tiles, filteredObs]
  )

  const heatmapData = useMemo(() => buildHeatmap(filteredObs), [filteredObs])
  const distributionData = useMemo(() => buildDistribution(filteredObs), [filteredObs])
  const trendData = useMemo(() => buildRollingTrend(filteredObs), [filteredObs])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Charts</h1>
        {store.projects.length > 0 && (
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12.5 }}
          >
            <option value="">All projects</option>
            {store.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
        {SUBTABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            style={{
              padding: '7px 13px',
              borderRadius: 999,
              fontSize: 12.5,
              whiteSpace: 'nowrap',
              border: `1px solid ${sub === t.key ? 'var(--accent)' : 'var(--border)'}`,
              color: sub === t.key ? 'var(--accent)' : 'var(--text-muted)',
              background: sub === t.key ? 'var(--accent-soft)' : 'transparent'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="li-card" style={{ padding: 14 }}>
        {sub === 'pareto' && <Pareto data={paretoData} />}
        {sub === 'heatmap' && <HeatMap grid={heatmapData} />}
        {sub === 'distribution' && <Distribution data={distributionData} />}
        {sub === 'trend' && <RollingTrend data={trendData} />}
      </div>

      {sub === 'pareto' && (
        <p className="li-muted" style={{ fontSize: 12, marginTop: 10 }}>
          Bars in the accent color make up the top 80% of occurrences — the vital few worth watching first.
        </p>
      )}
      {sub === 'heatmap' && (
        <p className="li-muted" style={{ fontSize: 12, marginTop: 10 }}>
          Darker cells mean more events happened in that hour on that day of the week.
        </p>
      )}
    </div>
  )
}
