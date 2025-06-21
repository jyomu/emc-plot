import { useState } from 'react'
import Plot from 'react-plotly.js'
import type { Data } from 'plotly.js'
import type { TouchstoneData } from './parseTouchstone'

export interface SParamChartProps {
  touchstone: TouchstoneData & { traces: Data[] }
}

function movingAverage(arr: number[], windowSize: number): number[] {
  const result: number[] = []
  let windowSum = 0
  for (let i = 0; i < arr.length; i++) {
    windowSum += arr[i]
    if (i >= windowSize) {
      windowSum -= arr[i - windowSize]
    }
    result.push(windowSum / Math.min(windowSize, i + 1))
  }
  return result
}

function SParamSelector({ sParams, selected, onChange }: { sParams: string[], selected: string[], onChange: (s: string) => void }) {
  return (
    <div style={{ margin: '12px 0' }}>
      <label>表示Sパラメータ: </label>
      {sParams.map(s => (
        <label key={s} style={{ marginRight: 8 }}>
          <input
            type="checkbox"
            checked={selected.includes(s)}
            onChange={() => onChange(s)}
          />
          {s}
        </label>
      ))}
    </div>
  )
}

function MovingAverageControl({ showMA, setShowMA, maWindow, setMaWindow, maxWindow }: { showMA: boolean, setShowMA: (b: boolean) => void, maWindow: number, setMaWindow: (n: number) => void, maxWindow: number }) {
  return (
    <div style={{ margin: '12px 0' }}>
      <label>
        <input type="checkbox" checked={showMA} onChange={e => setShowMA(e.target.checked)} />
        移動平均を表示
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
  )
}

export function SParamChart({ touchstone }: SParamChartProps) {
  const { chartData, sParams, format, traces } = touchstone
  const [selected, setSelected] = useState<string[]>(sParams.slice(0, 1))
  const [showMA, setShowMA] = useState(false)
  const [maWindow, setMaWindow] = useState(5)

  const yLabel = format === 'DB' ? 'Magnitude [dB]' : 'Magnitude'

  // x軸はHzのままtraceに渡す
  let plotData: Data[] = traces.filter(t => t.type === 'scatter' && selected.includes(t.name as string))
  plotData = plotData.map(t => {
    if (t.type === 'scatter' && Array.isArray(t.x)) {
      return {
        ...t,
        // x: (t.x as number[]).map(v => v / displayUnit.value), // ←Hzのまま
        hovertemplate: `%{x:.2s}Hz<br>%{y:.3f} ${yLabel.replace(/.*\[(.*)\]/, '$1') || ''}<extra></extra>`
      }
    }
    return t
  })
  if (showMA) {
    const maTraces: Data[] = selected.map(s => ({
      x: chartData.map(row => row.freq), // Hzのまま
      y: movingAverage(chartData.map(row => row[s]), maWindow),
      type: 'scatter',
      mode: 'lines',
      name: s + ' 移動平均',
      line: { dash: 'dash' },
      hovertemplate: `%{x:.2s}Hz<br>%{y:.3f} ${yLabel.replace(/.*\[(.*)\]/, '$1') || ''}<extra></extra>`
    }))
    plotData = [...plotData, ...maTraces]
  }

  return (
    <>
      <SParamSelector sParams={sParams} selected={selected} onChange={s => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
      <MovingAverageControl showMA={showMA} setShowMA={setShowMA} maWindow={maWindow} setMaWindow={setMaWindow} maxWindow={chartData.length} />
      {selected.length > 0 && (
        <Plot
          data={plotData}
          layout={{
            autosize: true,
            height: 400,
            xaxis: {
              title: { text: 'Frequency [Hz]' },
              tickformat: '~s', // SI prefix自動スケール
              ticksuffix: 'Hz',
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
      )}
    </>
  )
}
