import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function RollingTrend({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 4 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
          interval={Math.max(Math.floor(data.length / 7), 0)}
        />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
        <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
        <Bar dataKey="count" fill="var(--accent-soft)" radius={[4, 4, 0, 0]} />
        <Line type="monotone" dataKey="movingAvg" stroke="var(--accent)" strokeWidth={2.2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
