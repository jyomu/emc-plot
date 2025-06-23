import { PlotArea } from './PlotArea'
import type { PartialPlotData } from '../types/plot'

interface TabContentProps {
  spectrum: PartialPlotData[]
  cepstrum: PartialPlotData[]
}

export function TabContent({ spectrum, cepstrum }: TabContentProps) {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '8px 0' }}>スペクトラム</h4>
        <PlotArea
          space="frequency"
          data={spectrum}
        />
      </div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '8px 0' }}>ケプストラム</h4>
        <PlotArea
          space="cepstrum"
          data={cepstrum}
        />
      </div>
    </>
  )
}
