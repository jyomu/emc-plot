// PlotSection: タイトル・コントロールUI・プロット表示（PlotArea）をまとめる汎用レイアウト部品
// - データやコントロールはpropsで受け取り、ロジックは持たない
// - UI構造の共通化・再利用性向上が目的

import React, { useMemo } from 'react'
import { PlotArea } from './PlotArea'
import { PreprocessControls } from './PreprocessControls'
import { ma, logTransform, dftAbs, idftReal } from '../../utils/pipeline'
import type { PartialPlotData, LogType, ProcessParams } from '../../types/plot'
import { usePlotProcess } from '../../hooks/usePlotProcess'

export type PlotSpace = 'frequency' | 'time' | 'cepstrum' | 'none'

type PlotSectionProps =
  | { mode: 'raw', title: string, traces: PartialPlotData[], space: PlotSpace }
  | { mode: 'processed', processType: 'dft' | 'idft', traces: PartialPlotData[] }

const getInitialProcessParams = (type: 'dft' | 'idft'): ProcessParams =>
  type === 'dft'
    ? { key: 'dft', label: 'DFT', maEnabled: false, maWindow: 50, logType: 'none' }
    : { key: 'idft', label: 'IDFT', maEnabled: false, maWindow: 50, logType: 'none' }

export const PlotSection: React.FC<PlotSectionProps> = (props) => {
  const isProcessed = 'mode' in props && props.mode === 'processed'
  const processType = isProcessed ? props.processType : 'dft'
  const { process, setMaEnabled, setMaWindow, setLogType, showHalf, setShowHalf } = usePlotProcess(processType)

  const processedTraces = useMemo(() => {
    if (isProcessed) {
      const pipeline = [
        ma(process.maEnabled, process.maWindow),
        logTransform(process.logType),
        process.key === 'dft' ? dftAbs : idftReal
      ]
      return props.traces.map(t => {
        const y = pipeline.reduce((acc, fn) => fn(acc), t.y)
        return {
          ...t,
          y,
          name: t.name + (process.key === 'dft' ? ' (DFT)' : ' (IDFT)')
        }
      })
    }
    return []
  }, [isProcessed, process, props])

  const displayedTraces = useMemo(() => {
    if (isProcessed && showHalf && processedTraces.length > 0) {
      return processedTraces.map(t => ({
        ...t,
        x: (t.x ?? []).slice(0, Math.floor((t.x?.length ?? t.y.length) / 2)),
        y: t.y?.slice(0, Math.floor(t.y.length / 2)),
      }))
    }
    return processedTraces
  }, [isProcessed, processedTraces, showHalf])

  if ('mode' in props && props.mode === 'raw') {
    const { title, traces, space } = props
    return (
      <div>
        <div className="font-bold mb-1 flex items-center gap-2">{title}</div>
        <PlotArea space={space} data={traces} />
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
        <PlotArea space="none" data={displayedTraces} />
      </div>
    )
  }
}
