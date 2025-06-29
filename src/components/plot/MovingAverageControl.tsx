interface MovingAverageControlProps {
  showMA: boolean
  setShowMA: (b: boolean) => void
  maWindow: number
  setMaWindow: (n: number) => void
}

export function MovingAverageControl({ showMA, setShowMA, maWindow, setMaWindow }: MovingAverageControlProps) {
  return (
    <div style={{ margin: '12px 0' }}>
      <label>
        <input type="checkbox" checked={showMA} onChange={e => setShowMA(e.target.checked)} /> 移動平均を表示
      </label>
      {showMA && (
        <span style={{ marginLeft: 12 }}>
          ウィンドウサイズ:
          <input
            type="number"
            min={1}
            value={maWindow}
            onChange={e => setMaWindow(Number(e.target.value))}
            style={{ width: 60, marginLeft: 4 }}
          />
        </span>
      )}
    </div>
  )
}
