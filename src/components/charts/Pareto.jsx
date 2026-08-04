import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

export default function Pareto({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 40 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={60}
        />
        <YAxis yAxisId="count" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
        <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
        <Tooltip
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
        />
        <Bar yAxisId="count" dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.in80 ? 'var(--accent)' : 'var(--border)'} />
          ))}
        </Bar>
        <Line yAxisId="pct" type="monotone" dataKey="cumPct" stroke="var(--danger)" strokeWidth={2} dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
