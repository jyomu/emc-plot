import { PlotArea } from './PlotArea'
import { calcCepstrumStagesTraces } from '../utils/fftUtils'
import type { PlotData } from 'plotly.js'

interface TabContentProps {
  signal: Partial<PlotData>[]
}

function isNumberArray(arr: unknown): arr is number[] {
  return Array.isArray(arr) && arr.every(v => typeof v === 'number')
}

export function TabContent({ signal }: TabContentProps) {
  // yがnumber[]のtraceのみ処理
  const stages = signal
    .map(sig => isNumberArray(sig.y)
      ? calcCepstrumStagesTraces(sig.y)
      : null)
    .filter((s): s is NonNullable<typeof s> => !!s)

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '8px 0' }}>スペクトラム</h4>
        <PlotArea
          space="frequency"
          data={stages.map((stage, idx) => ({
            ...stage.amplitude,
            name: signal[idx]?.name ?? `S${idx + 1}`,
            type: 'scatter',
            mode: 'lines',
          }))}
        />
      </div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '8px 0' }}>ケプストラム</h4>
        <PlotArea
          space="cepstrum"
          data={stages.map((stage, idx) => ({
            ...stage.cepstrum,
            name: signal[idx]?.name ?? `S${idx + 1}`,
            type: 'scatter',
            mode: 'lines',
          }))}
        />
      </div>
    </>
  )
}
