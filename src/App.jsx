import { useState, useEffect, useMemo } from 'react'
import Nav from './components/Nav.jsx'
import Dashboard from './components/Dashboard.jsx'
import Events from './components/Events.jsx'
import Timeline from './components/Timeline.jsx'
import Fmea from './components/Fmea.jsx'
import Charts from './components/Charts.jsx'
import Projects from './components/Projects.jsx'
import Settings from './components/Settings.jsx'
import CheckInModal from './components/CheckInModal.jsx'
import ProjectLensBar from './components/ProjectLensBar.jsx'
import { IconExport, IconSun, IconMoon, IconLeaf } from './components/icons'
import { useTheme } from './theme/ThemeContext.jsx'
import { useStore } from './store/StoreContext.jsx'
import { buildFullExport, downloadCsv } from './utils/csv'
import { buildPareto, buildDistribution, buildRollingTrend } from './utils/stats'
import { fmtDate, minutesNowSinceMidnight, parseHHMM } from './utils/time'

const THEME_ICON = { warm: IconLeaf, dark: IconMoon, light: IconSun }

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [pendingCheckIn, setPendingCheckIn] = useState(null)
  const { themeKey, cycleTheme } = useTheme()
  const store = useStore()
  const ThemeIcon = THEME_ICON[themeKey] || IconLeaf

  // Poll once a minute for any scheduled check-in time that has arrived
  // and has not yet been handled today.
  useEffect(() => {
    function check() {
      const today = fmtDate(Date.now())
      const handled = store.settings.lastCheckInHandled[today] || []
      const now = minutesNowSinceMidnight()
      const due = store.settings.checkinTimes
        .filter((t) => !handled.includes(t) && parseHHMM(t) <= now)
        .sort((a, b) => parseHHMM(a) - parseHHMM(b))
      if (due.length && !pendingCheckIn) setPendingCheckIn(due[0])
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [store.settings.checkinTimes, store.settings.lastCheckInHandled, pendingCheckIn])

  function handleExport() {
    const pareto = buildPareto(
      store.tiles.map((t) => ({
        key: t.id,
        label: t.name,
        count: store.observations.filter((o) => o.eventId === t.id).length
      }))
    )
    const distribution = buildDistribution(store.observations)
    const rollingTrend = buildRollingTrend(store.observations)
    const csv = buildFullExport({
      tiles: store.tiles,
      observations: store.observations,
      projects: store.projects,
      completionTypes: store.completionTypes,
      completions: store.completions,
      settings: store.settings,
      fmeaRows: store.fmeaRows,
      pareto,
      distribution,
      rollingTrend
    })
    downloadCsv(`leading-indicators-${fmtDate(Date.now())}.csv`, csv)
  }

  const screens = useMemo(
    () => ({
      dashboard: <Dashboard onNavigate={setTab} />,
      events: <Events />,
      timeline: <Timeline />,
      fmea: <Fmea />,
      charts: <Charts />,
      projects: <Projects />,
      settings: <Settings />
    }),
    []
  )

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0
        }}
      >
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.2 }}>Leading Indicators</div>
          <div className="li-muted" style={{ fontSize: 12 }}>
            Discover what predicts your results
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={cycleTheme}
            aria-label="Change theme"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <ThemeIcon width={19} height={19} />
          </button>
          <button
            onClick={handleExport}
            aria-label="Export CSV"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <IconExport width={19} height={19} />
          </button>
        </div>
      </header>

      <ProjectLensBar />

      <main className="li-scroll" style={{ flex: 1, padding: 16, paddingBottom: 24 }}>
        {screens[tab]}
      </main>

      <Nav active={tab} onChange={setTab} />

      {pendingCheckIn && (
        <CheckInModal
          time={pendingCheckIn}
          onDone={() => {
            store.markCheckInHandled(pendingCheckIn)
            setPendingCheckIn(null)
          }}
        />
      )}
    </>
  )
}
