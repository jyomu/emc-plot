// PostprocessControls: 後処理パラメータのコントロールUI（移動平均表示等）を担当
// - 状態はusePostProcessControlsフックで管理
// - DFT/IDFT前半のみ表示は前処理に移動
// - UIのみ担当し、ロジックやデータ処理は持たない

import React from 'react'
import { usePostProcessControls } from '../../hooks/state/useProcessControls'

export const PostprocessControls: React.FC = () => {
  const { state, setShowMA, setMaWindow } = usePostProcessControls()

  return (
    <div style={{ margin: '12px 0' }}>
      <label>
        <input 
          type="checkbox" 
          checked={state.showMA} 
          onChange={e => setShowMA(e.target.checked)} 
        /> 移動平均を表示
      </label>
      {state.showMA && (
        <span style={{ marginLeft: 12 }}>
          ウィンドウサイズ:
          <input
            type="number"
            min={1}
            value={state.maWindow}
            onChange={e => setMaWindow(Number(e.target.value))}
            style={{ width: 60, marginLeft: 4 }}
          />
        </span>
      )}
    </div>
  )
}
