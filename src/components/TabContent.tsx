import { useState } from 'react'
import { PlotArea } from './PlotArea'
import { MovingAverageControl } from './MovingAverageControl'
import { calcCepstrumStages } from '../utils/fftUtils'
import { movingAverage } from '../utils/chartUtils'

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

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '8px 0' }}>スペクトラム</h4>
        {stages.map((stage, idx) => (
          <PlotArea
            key={`spectrum-${idx}`}
            space="frequency"
            data={{ f: stage.amplitude.map((_, i) => i), Y: stage.amplitude }}
            xLabel="Frequency [Hz]"
            yLabel="Amplitude"
          />
        ))}
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
        {stages.map((stage, idx) => (
          <PlotArea
            key={`preprocessed-${idx}`}
            space="frequency"
            data={{ f: stage.preProcessed.map((_, i) => i), Y: stage.preProcessed }}
            xLabel="Frequency [Hz]"
            yLabel="Pre-processed"
          />
        ))}
      </div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '8px 0' }}>ケプストラム</h4>
        {stages.map((stage, idx) => (
          <PlotArea
            key={`cepstrum-${idx}`}
            space="cepstrum"
            data={{ q: stage.cepstrum.map((_, i) => i), C: stage.cepstrum }}
            xLabel="Quefrency [s]"
            yLabel="Cepstrum"
          />
        ))}
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
