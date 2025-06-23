import { useState } from 'react'
import { PlotArea } from './PlotArea'
import { MovingAverageControl } from './MovingAverageControl'
import { calcCepstrumStages } from './utils/fftUtils'
import { movingAverage } from './utils/chartUtils'

interface TabContentProps {
  signal: number[][]
  preProcess?: (mag: number) => number
  showMA: boolean
  setShowMA: (b: boolean) => void
  maWindow: number
  setMaWindow: (n: number) => void
}

export function TabContent({
  signal,
  preProcess: preProcessProp = (mag) => Math.log(mag + 1e-12),
  showMA,
  setShowMA,
  maWindow,
  setMaWindow
}: TabContentProps) {
  // 前処理関数候補
  const preProcessOptions = [
    { key: 'log', label: 'log', fn: (mag: number) => Math.log(mag + 1e-12) },
    { key: 'id', label: 'id', fn: (mag: number) => mag },
    { key: 'sqrt', label: 'sqrt', fn: (mag: number) => Math.sqrt(Math.max(mag, 0)) },
    { key: 'square', label: 'square', fn: (mag: number) => mag * mag },
  ]
  const [preProcessKey, setPreProcessKey] = useState('log')
  const preProcess = preProcessOptions.find(opt => opt.key === preProcessKey)?.fn || preProcessProp

  // 移動平均適用
  const processedSignals = signal.map(sig => showMA ? movingAverage(sig, maWindow) : sig)
  const stages = processedSignals.map(sig => calcCepstrumStages(sig, preProcess))

  // 3つのグラフを縦に並べて常時表示
  const spectrumPlotData = stages.map((stage, idx) => ({
    x: stage.amplitude.map((_, i) => i),
    y: stage.amplitude,
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: `S${idx + 1}`
  }))
  const preProcessedPlotData = stages.map((stage, idx) => ({
    x: stage.preProcessed.map((_, i) => i),
    y: stage.preProcessed,
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: `S${idx + 1}`
  }))
  const cepstrumPlotData = stages.map((stage, idx) => ({
    x: stage.cepstrum.map((_, i) => i),
    y: stage.cepstrum,
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: `S${idx + 1}`
  }))

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '8px 0' }}>スペクトラム</h4>
        <PlotArea plotData={spectrumPlotData} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '8px 0' }}>前処理後</h4>
        <div style={{ marginBottom: 8 }}>
          <label>前処理関数: </label>
          <select value={preProcessKey} onChange={e => setPreProcessKey(e.target.value)}>
            {preProcessOptions.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
        <PlotArea plotData={preProcessedPlotData} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '8px 0' }}>ケプストラム</h4>
        <PlotArea plotData={cepstrumPlotData} />
      </div>
      <div style={{ marginTop: 8 }}>
        <MovingAverageControl
          showMA={showMA}
          setShowMA={setShowMA}
          maWindow={maWindow}
          setMaWindow={setMaWindow}
          maxWindow={signal.length}
        />
      </div>
    </>
  )
}
