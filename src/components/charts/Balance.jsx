import { ComposedChart, Line, Scatter, ReferenceArea, ReferenceLine, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { currentBalance, leaningLabel } from '../../utils/balance'
import { fmtClock } from '../../utils/time'

function BalanceTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const p = payload[0]?.payload
  if (!p) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', fontSize: 12 }}>
      <div style={{ fontWeight: 600 }}>{p.tileName}</div>
      <div className="li-muted">{fmtClock(p.timestamp)}</div>
      <div className="li-mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>
        {p.cumulative > 0 ? '+' : ''}
        {p.cumulative}
      </div>
    </div>
  )
}

export default function Balance({ points, positiveLabel, negativeLabel, zone }) {
  const balance = currentBalance(points)
  const yDomainAbs = Math.max(zone + 1, ...points.map((p) => Math.abs(p.cumulative)), 3)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Balance</span>
        <span className="li-mono" style={{ fontWeight: 700, fontSize: 15 }}>
          {balance > 0 ? '+' : ''}
          {balance}
        </span>
      </div>
      <div className="li-muted" style={{ fontSize: 12.5, marginBottom: 10 }}>
        {leaningLabel(balance, positiveLabel, negativeLabel, zone)}
      </div>

      {points.length === 0 ? (
        <p className="li-muted" style={{ fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
          No positive/negative-tagged events logged for this project yet.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={points} margin={{ top: 8, right: 8, left: -18, bottom: 4 }}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            />
            <YAxis domain={[-yDomainAbs, yDomainAbs]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
            <Tooltip content={<BalanceTooltip />} />
            <ReferenceArea y1={-zone} y2={zone} fill="var(--accent-soft)" fillOpacity={0.5} />
            <ReferenceLine y={0} stroke="var(--text-muted)" strokeWidth={1.5} />
            <Line type="stepAfter" dataKey="cumulative" stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Scatter
              dataKey="cumulative"
              shape={(props) => (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={5}
                  fill={props.payload.polarity === 'positive' ? 'var(--success)' : 'var(--danger)'}
                  stroke="var(--surface)"
                  strokeWidth={1.5}
                />
              )}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      <div style={{ display: 'flex', gap: 16, fontSize: 11.5, marginTop: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
          {positiveLabel}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} />
          {negativeLabel}
        </span>
        <span className="li-muted">Shaded band = comfort zone (±{zone})</span>
      </div>
    </div>
  )
}
