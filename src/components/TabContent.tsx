import { PlotArea } from './PlotArea'
import { calcCepstrumStages } from '../utils/fftUtils'

interface TabContentProps {
  signal: number[][]
}

export function TabContent({ signal }: TabContentProps) {
  const stages = signal.map(sig => calcCepstrumStages(sig))

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
