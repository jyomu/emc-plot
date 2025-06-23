import { useState } from 'react'
import { PlotArea } from './PlotArea'
import { calcCepstrumStages } from '../utils/fftUtils'

interface TabContentProps {
  signal: number[][]
  preProcess?: (mag: number) => number
}

export function TabContent({
  signal,
  preProcess: preProcessProp = (mag) => Math.log(mag + 1e-12),
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
  const stages = signal.map(sig => calcCepstrumStages(sig, preProcess))

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '8px 0' }}>スペクトラム</h4>
        <PlotArea
          space="frequency"
          data={stages.map((stage, idx) => ({
            x: stage.amplitude.map((_, i) => i),
            y: stage.amplitude,
            type: 'scatter',
            mode: 'lines',
            name: `S${idx + 1}`
          }))}
        />
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
        <PlotArea
          space="frequency"
          data={stages.map((stage, idx) => ({
            x: stage.preProcessed.map((_, i) => i),
            y: stage.preProcessed,
            type: 'scatter',
            mode: 'lines',
            name: `S${idx + 1}`
          }))}
        />
      </div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '8px 0' }}>ケプストラム</h4>
        <PlotArea
          space="cepstrum"
          data={stages.map((stage, idx) => ({
            x: stage.cepstrum.map((_, i) => i),
            y: stage.cepstrum,
            type: 'scatter',
            mode: 'lines',
            name: `S${idx + 1}`
          }))}
        />
      </div>
    </>
  )
}
