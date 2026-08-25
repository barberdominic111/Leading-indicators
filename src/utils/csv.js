function escapeCell(v) {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function rows(headers, data) {
  const lines = [headers.map(escapeCell).join(',')]
  data.forEach((row) => {
    lines.push(headers.map((h) => escapeCell(row[h])).join(','))
  })
  return lines.join('\n')
}

function section(title, csvBlock) {
  return `## ${title}\n${csvBlock}\n`
}

export function buildFullExport({ tiles, observations, projects, completionTypes, completions, settings, fmeaRows, pareto, distribution, rollingTrend }) {
  const blocks = []

  blocks.push(
    section(
      'Configuration',
      rows(
        ['key', 'value'],
        [
          { key: 'checkinTimes', value: settings.checkinTimes.join('; ') },
          { key: 'workdayStartMin', value: settings.detectionConfig.workdayStartMin },
          { key: 'workdayEndMin', value: settings.detectionConfig.workdayEndMin },
          { key: 'activeProject', value: settings.activeProjectId || '' },
          { key: 'exportedAt', value: new Date().toISOString() }
        ]
      )
    )
  )

  blocks.push(
    section(
      'Projects',
      rows(
        ['id', 'name', 'balanceMode', 'positiveLabel', 'negativeLabel', 'personAName', 'personBName', 'weightMode', 'balanceZone'],
        projects
      )
    )
  )

  blocks.push(
    section(
      'Tiles',
      rows(
        ['id', 'name', 'category', 'color', 'active'],
        tiles.map((t) => ({ ...t, active: t.active !== false }))
      )
    )
  )

  blocks.push(
    section(
      'Check-in Schedule',
      rows(['time'], settings.checkinTimes.map((t) => ({ time: t })))
    )
  )

  blocks.push(
    section(
      'Raw Observations',
      rows(
        ['id', 'timestamp', 'isoTime', 'eventId', 'eventName', 'note', 'project', 'customer', 'severity'],
        observations.map((o) => ({
          ...o,
          isoTime: new Date(o.timestamp).toISOString(),
          eventName: tiles.find((t) => t.id === o.eventId)?.name || o.eventId
        }))
      )
    )
  )

  blocks.push(
    section(
      'Completion Types',
      rows(['id', 'name'], completionTypes)
    )
  )

  blocks.push(
    section(
      'Completions (finished work reported at check-in)',
      rows(
        ['id', 'timestamp', 'isoTime', 'completionType', 'quantity', 'note', 'project'],
        completions.map((c) => ({
          ...c,
          isoTime: new Date(c.timestamp).toISOString(),
          completionType: completionTypes.find((t) => t.id === c.completionTypeId)?.name || c.completionTypeId
        }))
      )
    )
  )

  blocks.push(
    section(
      'Occurrence Table',
      rows(
        ['failureMode', 'category', 'occurrence'],
        fmeaRows.map((r) => ({ failureMode: r.failureMode, category: r.category, occurrence: r.occurrence }))
      )
    )
  )

  blocks.push(
    section(
      'Timeline Data',
      rows(
        ['timestamp', 'isoTime', 'eventName', 'note', 'project', 'customer'],
        observations
          .slice()
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((o) => ({
            timestamp: o.timestamp,
            isoTime: new Date(o.timestamp).toISOString(),
            eventName: tiles.find((t) => t.id === o.eventId)?.name || o.eventId,
            note: o.note,
            project: o.project,
            customer: o.customer
          }))
      )
    )
  )

  blocks.push(
    section(
      'Generated FMEA',
      rows(
        ['failureMode', 'category', 'occurrence', 'severity', 'detection', 'polarity', 'rpn'],
        fmeaRows
      )
    )
  )

  blocks.push(
    section(
      'Pareto Chart Data',
      rows(['label', 'count', 'pct', 'cumPct', 'in80'], pareto)
    )
  )

  blocks.push(
    section(
      'Event Distribution Chart Data',
      rows(['name', 'count'], distribution)
    )
  )

  blocks.push(
    section(
      'Rolling Trend Chart Data',
      rows(['date', 'count', 'movingAvg'], rollingTrend)
    )
  )

  return blocks.join('\n')
}

export function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
