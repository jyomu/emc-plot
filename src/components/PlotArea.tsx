import Plot from 'react-plotly.js'
import { useState } from 'react'
import { movingAverage } from '../utils/chartUtils'
import type { PartialPlotData } from '../types/plot'
import type { Dash, Layout } from 'plotly.js'
import { MovingAverageControl } from '../components/MovingAverageControl'

// 空間ごとのレイアウトを返す関数
function getLayoutForSpace(space: 'time' | 'frequency' | 'cepstrum'): Partial<Layout> {
  // 共通部分
  const base = {
    autosize: true,
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
  }
}

// 空間ごとのhovertemplate
function getHoverTemplate(space: 'time' | 'frequency' | 'cepstrum'): string {
  switch (space) {
    case 'time':
      return '%{x}<br>%{y:.3f} <extra></extra>'
    case 'frequency':
      return '%{x:.2s}Hz<br>%{y:.3f} <extra></extra>'
    case 'cepstrum':
      return '%{x}<br>%{y:.3f} <extra></extra>'
  }
}

type PlotAreaProps =
  | { space: 'time'; data: PartialPlotData[] }
  | { space: 'frequency'; data: PartialPlotData[] }
  | { space: 'cepstrum'; data: PartialPlotData[] }

export function PlotArea(props: PlotAreaProps) {
  const [showMA, setShowMA] = useState(false)
  const [maWindow, setMaWindow] = useState(50)

  let traces: PartialPlotData[] = props.data
  const hovertemplate = getHoverTemplate(props.space)

  if (showMA && maWindow && traces.length > 0) {
    const maTraces = traces
      .filter((t): t is { x: number[]; y: number[]; name?: string } =>
        Array.isArray(t.x) && t.x.every(v => typeof v === 'number') &&
        Array.isArray(t.y) && t.y.every(v => typeof v === 'number')
      )
      .map(t => ({
        x: t.x,
        y: movingAverage(t.y, maWindow),
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: t.name ? `${t.name} (MA)` : 'Moving Average',
        line: { dash: 'dash' as const },
        hovertemplate,
      }))
    traces = [...traces, ...maTraces]
  }

  // 各traceに線種を付与（MA以外は実線、色は自動）
  const plotData = traces.map(trace => {
    const isMA = typeof trace.name === 'string' && trace.name.includes('(MA)')
    const dash: Dash = isMA ? 'dash' : 'solid'
    return {
      ...trace,
      type: 'scatter' as const,
      line: { dash },
      hovertemplate,
    }
  })

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
        config={{ responsive: true }}
      />
    </div>
  )
}
