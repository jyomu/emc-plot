import Plot from 'react-plotly.js'
import { useState } from 'react'
import { movingAverage } from '../utils/chartUtils'
import type { PartialPlotData } from '../types/plot'
import type { Layout } from 'plotly.js'
import { MovingAverageControl } from '../components/MovingAverageControl'

// 空間ごとのレイアウトを返す関数
function getLayoutForSpace(space: 'time' | 'frequency' | 'cepstrum' | 'none'): Partial<Layout> {
  const base: Partial<Layout> = {
    autosize: true,
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    font: { color: 'black' },
    height: 400,
    legend: { orientation: 'h' },
    margin: { t: 30, l: 60, r: 30, b: 60 }
  } as const
  switch (space) {
    case 'time':
      return {
        ...base,
        xaxis: { title: { text: 'Time [s]' }, tickformat: '~s', ticksuffix: 's' },
        yaxis: { title: { text: 'Amplitude' }, tickformat: '~s' },
      }
    case 'frequency':
      return {
        ...base,
        xaxis: { title: { text: 'Frequency [Hz]' }, tickformat: '~s', ticksuffix: 'Hz' },
        yaxis: { title: { text: 'Amplitude' }, tickformat: '~s' },
      }
    case 'cepstrum':
      return {
        ...base,
        xaxis: { title: { text: 'Quefrency [s]' }, tickformat: '~s', ticksuffix: 's' },
        yaxis: { title: { text: 'Cepstrum' }, tickformat: '~s' },
      }
    case 'none':
      return {
        ...base,
        xaxis: { title: { text: 'Index' } },
        yaxis: { title: { text: 'Value' } },
      }
  }
}

type PlotAreaProps =
  | { space: 'time'; data: PartialPlotData[] }
  | { space: 'frequency'; data: PartialPlotData[] }
  | { space: 'cepstrum'; data: PartialPlotData[] }
  | { space: 'none'; data: PartialPlotData[] }

export function PlotArea(props: PlotAreaProps) {
  const [showMA, setShowMA] = useState(false)
  const [maWindow, setMaWindow] = useState(50)

  const plotData: PartialPlotData[] = props.data.slice()

  if (showMA && maWindow && plotData.length > 0) {
    const maTraces = plotData
      .map(t => ({
      x: t.x,
      y: movingAverage(t.y, maWindow),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: t.name ? `${t.name} (MA)` : 'Moving Average',
      line: { dash: 'dash' as const },
      }))
    plotData.push(...maTraces)
  }

  return (
    <div>
      <MovingAverageControl
        showMA={showMA}
        setShowMA={setShowMA}
        maWindow={maWindow}
        setMaWindow={setMaWindow}
      />
      <Plot
        data={plotData}
        layout={getLayoutForSpace(props.space)}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        config={{ 
          responsive: true,
          editable: true,
          
         }}
      />
    </div>
  )
}
