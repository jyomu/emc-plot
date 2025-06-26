// PreprocessControls: 各種前処理パラメータのコントロールUI（移動平均・logType等）を担当
// - 状態はpropsで受け取り、変更はコールバックで親に伝える
// - UIのみ担当し、ロジックやデータ処理は持たない

import React from 'react'
import type { LogType } from '../types/plot'

export interface PreprocessControlsProps {
  maEnabled: boolean;
  maWindow: number;
  onMaEnabledChange: (v: boolean) => void;
  onMaWindowChange: (v: number) => void;
  logType: LogType;
  onLogTypeChange: (v: LogType) => void;
}

export const PreprocessControls: React.FC<PreprocessControlsProps> = ({
  maEnabled,
  maWindow,
  onMaEnabledChange,
  onMaWindowChange,
  logType,
  onLogTypeChange
}) => (
  <>
    <label className="ml-4">
      <input
        type="checkbox"
        checked={maEnabled}
        onChange={e => onMaEnabledChange(e.target.checked)}
      /> 移動平均
    </label>
    {maEnabled && (
      <input
        type="number"
        min={2}
        max={100}
        value={maWindow}
        onChange={e => onMaWindowChange(Number(e.target.value))}
        className="w-16 ml-2"
      />
    )}
    {logType !== undefined && (
      <label className="ml-4">
        log関数:
        <select
          value={logType}
          onChange={e => {
            const v = e.target.value
            if (v === 'log' || v === 'log10' || v === 'log2' || v === 'none') onLogTypeChange(v)
          }}
          className="ml-1"
        >
          <option value="log">log</option>
          <option value="log10">log10</option>
          <option value="log2">log2</option>
          <option value="none">なし</option>
        </select>
      </label>
    )}
  </>
)
