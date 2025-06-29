import type { PartialPlotData } from '../../types/plot'

export function SParamSelector({ traces, selected, onChange }: { traces: PartialPlotData[]; selected: string[]; onChange: (s: string) => void }) {
  const sParams = traces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean)
  return (
    <div style={{ margin: '12px 0' }}>
      <label>表示Sパラメータ: </label>
      {sParams.map((s: string) => (
        <label key={s} style={{ marginRight: 8 }}>
          <input
            type="checkbox"
            checked={selected.includes(s)}
            onChange={() => onChange(s)}
          />
          {s}
        </label>
      ))}
    </div>
  )
}
