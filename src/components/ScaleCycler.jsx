import { useState } from 'react'
import { nextScaleValue, labelForScaleValue } from '../utils/fmea'

// A small control used for both Severity and Detection on the FMEA screen.
// Tapping steps to the next value in the configured scale (wrapping around)
// and always shows the current value's word, not just momentarily —
// so the meaning is visible whether or not you just tapped it.
export default function ScaleCycler({ value, scale, onChange, emptyHint = 'Tap to set' }) {
  const [popKey, setPopKey] = useState(0)
  const label = labelForScaleValue(value, scale)
  const sorted = [...(scale || [])].sort((a, b) => a.value - b.value)

  function handleClick() {
    const next = value == null ? sorted[0]?.value : nextScaleValue(value, scale)
    if (next == null) return
    onChange(next)
    setPopKey((k) => k + 1)
  }

  return (
    <button
      onClick={handleClick}
      disabled={!sorted.length}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        padding: '4px 8px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--surface-alt)',
        minWidth: 64,
        cursor: sorted.length ? 'pointer' : 'default'
      }}
    >
      <span className="li-mono" style={{ fontSize: 14, fontWeight: 700 }}>
        {value ?? '—'}
      </span>
      <span key={popKey} className={popKey ? 'li-counter-pop' : ''} style={{ fontSize: 10.5, color: 'var(--accent)', fontWeight: 600 }}>
        {label || (sorted.length ? emptyHint : 'No scale set')}
      </span>
    </button>
  )
}
