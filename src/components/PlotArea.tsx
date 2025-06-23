import Plot from 'react-plotly.js'
import { useState } from 'react'
import { movingAverage } from '../utils/chartUtils'
import type { PartialPlotData } from '../types/plot'
import type { Dash } from 'plotly.js'

// PlotAreaProps: dataはPartialPlotData[]型で統一
// spaceごとに属性を切り替える
const spaceConfig = {
  time: {
    xLabel: 'Time [s]',
    yLabel: 'Amplitude',
    tickSuffix: '',
    hovertemplate: '%{x}<br>%{y:.3f} <extra></extra>',
  },
  frequency: {
    xLabel: 'Frequency [Hz]',
    yLabel: 'Amplitude',
    tickSuffix: 'Hz',
    hovertemplate: '%{x:.2s}Hz<br>%{y:.3f} <extra></extra>',
  },
  cepstrum: {
    xLabel: 'Quefrency [s]',
    yLabel: 'Cepstrum',
    tickSuffix: '',
    hovertemplate: '%{x}<br>%{y:.3f} <extra></extra>',
  },
} as const

type PlotAreaProps =
  | { space: 'time'; data: PartialPlotData[] }
  | { space: 'frequency'; data: PartialPlotData[] }
  | { space: 'cepstrum'; data: PartialPlotData[] }

export function PlotArea(props: PlotAreaProps) {
  const [showMA, setShowMA] = useState(false)
  const [maWindow, setMaWindow] = useState(50)

  let traces: PartialPlotData[] = props.data
  const config = spaceConfig[props.space]

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
        line: { dash: 'dash' as const }, // MAのみ点線
        hovertemplate: config.hovertemplate,
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
      hovertemplate: config.hovertemplate,
    }
  })

  return (
    <div>
      <div style={{ margin: '12px 0' }}>
        <label>
          <input type="checkbox" checked={showMA} onChange={e => setShowMA(e.target.checked)} /> 移動平均を表示
        </label>
        {showMA && (
          <span style={{ marginLeft: 12 }}>
            ウィンドウサイズ:
            <input
              type="number"
              min={1}
              max={traces.length > 0 && Array.isArray(traces[0].x) ? traces[0].x.length : 1}
              value={maWindow}
              onChange={e => setMaWindow(Number(e.target.value))}
              style={{ width: 60, marginLeft: 4 }}
            />
          </span>
        )}
      </div>
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          height: 400,
          xaxis: {
            title: { text: config.xLabel },
            tickformat: '~s',
            ticksuffix: config.tickSuffix,
          },
          yaxis: {
            title: { text: config.yLabel },
            tickformat: '~s',
          },
          legend: { orientation: 'h' },
          margin: { t: 30, l: 60, r: 30, b: 60 }
        }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        config={{ responsive: true }}
      />
    </div>
  )
}
