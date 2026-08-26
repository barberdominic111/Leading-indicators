import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { buildPareto, buildHeatmap, buildDistribution, buildRollingTrend } from '../utils/stats'
import { computeBalancePoints, projectLabels, isBalanceOn } from '../utils/balance'
import Pareto from './charts/Pareto.jsx'
import HeatMap from './charts/HeatMap.jsx'
import Distribution from './charts/Distribution.jsx'
import RollingTrend from './charts/RollingTrend.jsx'
import Balance from './charts/Balance.jsx'

const SUBTABS = [
  { key: 'pareto', label: 'Pareto' },
  { key: 'heatmap', label: 'Heat Map' },
  { key: 'distribution', label: 'Distribution' },
  { key: 'trend', label: 'Rolling Trend' },
  { key: 'balance', label: 'Balance' }
]

export default function Charts() {
  const store = useStore()
  const [sub, setSub] = useState('pareto')
  const lens = store.settings.activeProjectId || ''

  const filteredObs = useMemo(
    () => (lens ? store.observations.filter((o) => o.project === lens) : store.observations),
    [store.observations, lens]
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

  const selectedProject = store.projects.find((p) => p.id === lens)
  const balanceReady = isBalanceOn(selectedProject)
  const balancePoints = useMemo(() => {
    if (!balanceReady) return []
    const tilesById = {}
    store.tiles.forEach((t) => {
      tilesById[t.id] = t
    })
    return computeBalancePoints(
      store.observations,
      selectedProject.id,
      store.settings.polarityByTile,
      selectedProject.weightMode,
      store.fmeaByTileId,
      tilesById
    )
  }, [balanceReady, selectedProject, store.observations, store.settings.polarityByTile, store.fmeaByTileId, store.tiles])
  const balanceLabels = projectLabels(selectedProject)

  return (
    <div>
      <h1 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 600 }}>Charts</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 14 }}>
        {SUBTABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            style={{
              padding: '8px 6px',
              borderRadius: 999,
              fontSize: 12.5,
              textAlign: 'center',
              gridColumn: t.key === 'balance' ? '1 / -1' : undefined,
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
        {sub === 'balance' &&
          (!lens ? (
            <p className="li-muted" style={{ fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
              Pick a specific project in the "Viewing" bar above to see its balance.
            </p>
          ) : !balanceReady ? (
            <p className="li-muted" style={{ fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
              Turn on balance tracking for {selectedProject.name} in the Projects tab to see this.
            </p>
          ) : (
            <Balance points={balancePoints} positiveLabel={balanceLabels.positive} negativeLabel={balanceLabels.negative} zone={selectedProject.balanceZone ?? 3} />
          ))}
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
