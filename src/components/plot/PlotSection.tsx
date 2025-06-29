// PlotSection: タイトル・コントロールUI・プロット表示（PlotArea）をまとめる汎用レイアウト部品
// - データやコントロールはpropsで受け取り、ロジックは持たない
// - UI構造の共通化・再利用性向上が目的

import { PlotArea } from './PlotArea'
import { PreprocessControls } from './PreprocessControls'
import { usePlotProcess } from '../../hooks/usePlotProcess'

export type PlotSpace = 'frequency' | 'time' | 'cepstrum' | 'none'

export function PlotSection(props: { mode: 'raw', title: string, space: PlotSpace } | { mode: 'processed', processType: 'dft' | 'idft' }) {
  const isProcessed = 'mode' in props && props.mode === 'processed'
  const processType = isProcessed ? props.processType : 'dft'
  const { process, setMaEnabled, setMaWindow, setLogType, showHalf, setShowHalf } = usePlotProcess(processType)

  if (props.mode === 'raw') {
    return (
      <div>
        <div className="font-bold mb-1 flex items-center gap-2">{props.title}</div>
        <PlotArea space={props.space} mode="raw" />
      </div>
    )
  } else {
    return (
      <div>
        <div className="font-bold mb-1 flex items-center gap-2">
          {process.label}
          <PreprocessControls
            maEnabled={process.maEnabled}
            maWindow={process.maWindow}
            onMaEnabledChange={setMaEnabled}
            onMaWindowChange={setMaWindow}
            logType={process.logType}
            onLogTypeChange={setLogType}
          />
        </div>
        <label htmlFor="showHalfCheckbox" style={{ display: 'block', margin: '8px 0' }}>
          <input
            id="showHalfCheckbox"
            type="checkbox"
            checked={showHalf}
            onChange={e => setShowHalf(e.target.checked)}
          /> DFT/IDFT前半のみ表示
        </label>
        <PlotArea space="none" mode={processType} />
      </div>
    )
  }
}
