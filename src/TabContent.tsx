import { PlotArea } from './PlotArea'
import type { PlotData } from 'plotly.js'
import { MovingAverageControl } from './MovingAverageControl'

interface TabContentProps {
  plotData: Partial<PlotData>[];
  xLabel: string;
  yLabel: string;
  activeTab: string;
  showMA: boolean;
  setShowMA: (b: boolean) => void;
  maWindow: number;
  setMaWindow: (n: number) => void;
}

export function TabContent({
  plotData,
  xLabel,
  yLabel,
  activeTab,
  showMA,
  setShowMA,
  maWindow,
  setMaWindow
}: TabContentProps) {
  return (
    <>
      {plotData.length > 0 && (
        <>
          <PlotArea
            plotData={plotData}
            xLabel={xLabel}
            yLabel={yLabel}
            activeTab={activeTab}
          />
          <div style={{ marginTop: 8 }}>
            <MovingAverageControl
              showMA={showMA}
              setShowMA={setShowMA}
              maWindow={maWindow}
              setMaWindow={setMaWindow}
              maxWindow={plotData[0]?.x && Array.isArray(plotData[0].x) ? plotData[0].x.length : 1}
            />
          </div>
        </>
      )}
    </>
  )
}
