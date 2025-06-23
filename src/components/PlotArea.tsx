import Plot from 'react-plotly.js'
import type { PlotData } from 'plotly.js'
import { useState } from 'react'
import { movingAverage } from '../utils/chartUtils'

// PlotAreaProps: dataはPartial<PlotData>[]型で統一
type PlotAreaProps =
  | { space: 'time'; data: Partial<PlotData>[] }
  | { space: 'frequency'; data: Partial<PlotData>[] }
  | { space: 'cepstrum'; data: Partial<PlotData>[] }

export function PlotArea(props: PlotAreaProps) {
  const [showMA, setShowMA] = useState(false)
  const [maWindow, setMaWindow] = useState(50)

  let traces: Partial<PlotData>[] = props.data

  const labelMap = {
    time: { x: 'Time [s]', y: 'Amplitude' },
    frequency: { x: 'Frequency [Hz]', y: 'Amplitude' },
    cepstrum: { x: 'Quefrency [s]', y: 'Cepstrum' },
  } as const

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
        line: { dash: 'dash' as const, color: '#888' }
      }))
    traces = [...traces, ...maTraces]
  }

  const maxWindow = traces.length > 0 && Array.isArray(traces[0].x) ? traces[0].x.length : 1

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
              max={maxWindow}
              value={maWindow}
              onChange={e => setMaWindow(Number(e.target.value))}
              style={{ width: 60, marginLeft: 4 }}
            />
          </span>
        )}
      </div>
      <Plot
        data={traces}
        layout={{
          autosize: true,
          height: 400,
          xaxis: { title: { text: labelMap[props.space].x } },
          yaxis: { title: { text: labelMap[props.space].y } },
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
