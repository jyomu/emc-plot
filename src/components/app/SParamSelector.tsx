import { useTraces } from '../../hooks/useTraces'
import { useSelectedTraces } from '../../hooks/useSelectedTraces'

export function SParamSelector() {
  const { sParams } = useTraces()
  const { selected, toggleSelected } = useSelectedTraces()
  return (
    <div style={{ margin: '12px 0' }}>
      <label>表示Sパラメータ: </label>
      {sParams.map((s: string) => (
        <label key={s} style={{ marginRight: 8 }}>
          <input
            type="checkbox"
            checked={selected.includes(s)}
            onChange={() => toggleSelected(s)}
          />
          {s}
        </label>
      ))}
    </div>
  )
}
