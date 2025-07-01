import { useTraces } from '../../hooks/data/useTraces'
import { useSelectedSParams } from '../../hooks/state/useSelectedSParams'

export function SParamSelector() {
  const { sParams } = useTraces()
  const { selectedSParams, toggleSelectedSParam } = useSelectedSParams()
  
  return (
    <div style={{ margin: '12px 0' }}>
      <label>表示Sパラメータ: </label>
      {sParams.map((s: string) => (
        <label key={s} style={{ marginRight: 8 }}>
          <input
            type="checkbox"
            checked={selectedSParams.includes(s)}
            onChange={() => toggleSelectedSParam(s)}
          />
          {s}
        </label>
      ))}
    </div>
  )
}
