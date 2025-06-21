import Plot from 'react-plotly.js'
import type { PlotData } from 'plotly.js'

interface PlotAreaProps {
  plotData: Partial<PlotData>[]
  xLabel: string
  yLabel: string
  activeTab: string
}

export function PlotArea({ plotData, xLabel, yLabel, activeTab }: PlotAreaProps) {
  return (
    <Plot
      data={plotData}
      layout={{
        autosize: true,
        height: 400,
        xaxis: {
          title: { text: xLabel },
          tickformat: '~s',
          ticksuffix: activeTab === 'fft' ? 'Hz' : (activeTab === 'raw' ? 'Hz' : ''),
        },
        yaxis: {
          title: { text: yLabel },
          tickformat: '.3f',
        },
        legend: { orientation: 'h' },
        margin: { t: 30, l: 60, r: 30, b: 60 }
      }}
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
      config={{ responsive: true }}
    />
  )
}
