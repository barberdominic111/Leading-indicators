export default function HeatMap({ grid }) {
  const max = Math.max(1, ...grid.flatMap((row) => row.hours))
  const cellW = 12
  const cellH = 20
  const padL = 32
  const padT = 6
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${padL + hours.length * cellW + 4} ${padT + grid.length * cellH + 16}`}
        width={padL + hours.length * cellW + 4}
        height={padT + grid.length * cellH + 16}
      >
        {grid.map((row, r) => (
          <g key={row.day}>
            <text x={0} y={padT + r * cellH + cellH / 2 + 4} fontSize="9.5" fill="var(--text-muted)">
              {row.day}
            </text>
            {row.hours.map((count, h) => {
              const intensity = count / max
              return (
                <rect
                  key={h}
                  x={padL + h * cellW}
                  y={padT + r * cellH}
                  width={cellW - 1.5}
                  height={cellH - 3}
                  rx={3}
                  fill={intensity === 0 ? 'var(--surface-alt)' : 'var(--accent)'}
                  opacity={intensity === 0 ? 1 : 0.25 + intensity * 0.75}
                >
                  <title>
                    {row.day} {h}:00 — {count} event{count === 1 ? '' : 's'}
                  </title>
                </rect>
              )
            })}
          </g>
        ))}
        {[0, 6, 12, 18].map((h) => (
          <text key={h} x={padL + h * cellW} y={padT + grid.length * cellH + 12} fontSize="9" fill="var(--text-muted)">
            {h}h
          </text>
        ))}
      </svg>
    </div>
  )
}
