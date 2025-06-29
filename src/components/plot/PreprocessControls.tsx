// PreprocessControls: 各種前処理パラメータのコントロールUI（移動平均・logType等）を担当
// - 状態はusePreProcessControlsフックで管理（DFT/IDFTで個別）
// - UIのみ担当し、ロジックやデータ処理は持たない

import React from 'react'
import { usePreProcessControls } from '../../hooks/useProcessControls'

interface PreprocessControlsProps {
  processType: 'dft' | 'idft'
}

export const PreprocessControls: React.FC<PreprocessControlsProps> = ({ processType }) => {
  const { state, setMaEnabled, setMaWindow, setLogType, setShowHalf } = usePreProcessControls(processType)

  return (
    <>
      <label className="ml-4">
        <input
          type="checkbox"
          checked={state.maEnabled}
          onChange={e => setMaEnabled(e.target.checked)}
        /> 移動平均
      </label>
      {state.maEnabled && (
        <input
          type="number"
          min={2}
          max={100}
          value={state.maWindow}
          onChange={e => setMaWindow(Number(e.target.value))}
          className="w-16 ml-2"
        />
      )}
      <label className="ml-4">
        log関数:
        <select
          value={state.logType}
          onChange={e => {
            const v = e.target.value
            if (v === 'log' || v === 'log10' || v === 'log2' || v === 'none') setLogType(v)
          }}
          className="ml-1"
        >
          <option value="log">log</option>
          <option value="log10">log10</option>
          <option value="log2">log2</option>
          <option value="none">なし</option>
        </select>
      </label>
      <label className="ml-4">
        <input
          type="checkbox"
          checked={state.showHalf}
          onChange={e => setShowHalf(e.target.checked)}
        /> 前半のみ表示
      </label>
    </>
  )
}
