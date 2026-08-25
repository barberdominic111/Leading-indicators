import { useState } from 'react'

// Cycles Neutral -> Positive -> Negative -> Neutral. Neutral means this
// tile doesn't count toward any project's balance at all. Labels adapt
// to whichever project is currently active (its custom word pair, or
// person names in Dyad mode), falling back to generic words otherwise.
export default function PolarityToggle({ value, onChange, positiveLabel, negativeLabel }) {
  const [popKey, setPopKey] = useState(0)

  function handleClick() {
    const next = value === 'positive' ? 'negative' : value === 'negative' ? null : 'positive'
    onChange(next)
    setPopKey((k) => k + 1)
  }

  const label = value === 'positive' ? positiveLabel : value === 'negative' ? negativeLabel : 'Neutral'
  const color = value === 'positive' ? 'var(--success)' : value === 'negative' ? 'var(--danger)' : 'var(--text-muted)'
  const symbol = value === 'positive' ? '+' : value === 'negative' ? '−' : '·'

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        padding: '8px 10px',
        borderRadius: 8,
        border: `1px solid ${value ? color : 'var(--border)'}`,
        background: 'var(--surface-alt)',
        width: '100%'
      }}
    >
      <span className="li-muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3 }}>
        Polarity
      </span>
      <span className="li-mono" style={{ fontSize: 15, fontWeight: 700, color }}>
        {symbol}
      </span>
      <span
        key={popKey}
        className={popKey ? 'li-counter-pop' : ''}
        style={{ fontSize: 11, color, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}
      >
        {label}
      </span>
    </button>
  )
}
