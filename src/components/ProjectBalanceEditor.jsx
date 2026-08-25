function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            padding: '7px 4px',
            borderRadius: 8,
            fontSize: 12,
            border: `1px solid ${value === opt.value ? 'var(--accent)' : 'var(--border)'}`,
            color: value === opt.value ? 'var(--accent)' : 'var(--text-muted)',
            background: value === opt.value ? 'var(--accent-soft)' : 'transparent'
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function LabeledInput({ label, value, onChange }) {
  return (
    <div style={{ flex: 1 }}>
      <div className="li-muted" style={{ fontSize: 10.5, marginBottom: 4 }}>
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13, background: 'var(--surface-alt)' }}
      />
    </div>
  )
}

export default function ProjectBalanceEditor({ project, onUpdate }) {
  const mode = project.balanceMode || 'off'

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
      <div className="li-muted" style={{ fontSize: 11, marginBottom: 6 }}>
        Track as
      </div>
      <SegmentedControl
        value={mode}
        onChange={(v) => onUpdate({ balanceMode: v })}
        options={[
          { value: 'off', label: 'Off' },
          { value: 'solo', label: 'Solo' },
          { value: 'dyad', label: 'Dyad' }
        ]}
      />

      {mode !== 'off' && (
        <>
          <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
            {mode === 'solo' ? (
              <>
                <LabeledInput label="Positive word" value={project.positiveLabel || 'Energizing'} onChange={(v) => onUpdate({ positiveLabel: v })} />
                <LabeledInput label="Negative word" value={project.negativeLabel || 'Draining'} onChange={(v) => onUpdate({ negativeLabel: v })} />
              </>
            ) : (
              <>
                <LabeledInput label="Person A (+)" value={project.personAName || 'Person A'} onChange={(v) => onUpdate({ personAName: v })} />
                <LabeledInput label="Person B (−)" value={project.personBName || 'Person B'} onChange={(v) => onUpdate({ personBName: v })} />
              </>
            )}
          </div>

          <div className="li-muted" style={{ fontSize: 11, marginBottom: 6 }}>
            Weight per tap
          </div>
          <SegmentedControl
            value={project.weightMode || 'simple'}
            onChange={(v) => onUpdate({ weightMode: v })}
            options={[
              { value: 'simple', label: 'Simple (1)' },
              { value: 'complex', label: 'Complex (RPN)' }
            ]}
          />

          <label style={{ fontSize: 12, display: 'block', marginTop: 10 }} className="li-muted">
            Comfort zone ±
            <input
              type="number"
              min={0}
              max={20}
              value={project.balanceZone ?? 3}
              onChange={(e) => onUpdate({ balanceZone: Number(e.target.value) })}
              style={{ width: 50, marginLeft: 8, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)' }}
            />
          </label>

          <p className="li-muted" style={{ fontSize: 11, marginTop: 8, marginBottom: 0 }}>
            Assign each event's polarity on the FMEA screen — this only decides what the labels say and how each
            tap is weighed.
          </p>
        </>
      )}
    </div>
  )
}
