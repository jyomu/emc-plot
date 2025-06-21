import { useState } from 'react'
import Plot from 'react-plotly.js'
import type { TouchstoneData, ChartRow } from './parseTouchstone'
import { freqUnitOptions } from './freqUnit'

export interface SParamChartProps {
  touchstone: TouchstoneData
}

const colors = [
  '#8884d8', '#82ca9d', '#ff7300', '#ff0000', '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#A28FD0', '#F67280', '#355C7D', '#6C5B7B', '#C06C84', '#F8B195', '#355C7D', '#99B898'
]

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

function createMovingAverageData(chartData: ChartRow[], selected: string[], windowSize: number): ChartRow[] {
  const movingAverageMap: Record<string, number[]> = {}
  selected.forEach(s => {
    const arr = chartData.map(d => d[s])
    movingAverageMap[s] = movingAverage(arr, windowSize)
  })
  return chartData.map((row, i): ChartRow => {
    const base: ChartRow = { freq: row.freq }
    selected.forEach(s => {
      base[s] = row[s]
      base[s + '_MA'] = movingAverageMap[s][i]
    })
    return base
  })
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

type FreqUnitOption = typeof freqUnitOptions[number]

function FreqUnitSelector({ displayUnit, setDisplayUnit }: { displayUnit: FreqUnitOption, setDisplayUnit: (u: FreqUnitOption) => void }) {
  return (
    <div style={{ margin: '12px 0' }}>
      <label>周波数単位: </label>
      <select value={displayUnit.label} onChange={e => {
        const unit = freqUnitOptions.find(u => u.label === e.target.value)
        if (unit) setDisplayUnit(unit)
      }}>
        {freqUnitOptions.map(u => (
          <option key={u.label} value={u.label}>{u.label}</option>
        ))}
      </select>
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
  const { chartData, sParams, format, freqUnit } = touchstone
  const [selected, setSelected] = useState<string[]>(sParams.slice(0, 1))
  const defaultUnit = freqUnitOptions.find(u => u.label.toUpperCase() === freqUnit) || freqUnitOptions[0]
  const [displayUnit, setDisplayUnit] = useState<FreqUnitOption>(defaultUnit)
  const [showMA, setShowMA] = useState(false)
  const [maWindow, setMaWindow] = useState(5)

  const yLabel = format === 'DB' ? 'Magnitude [dB]' : 'Magnitude'
  const freqLabel = `Frequency [${displayUnit.label}]`

  const maData = createMovingAverageData(chartData, selected, maWindow)
  const plotData = (showMA ? maData : chartData)

  // Plotly用データ生成
  const traces: import('plotly.js').Data[] = []
  selected.forEach((s, idx) => {
    traces.push({
      x: plotData.map(row => row.freq / displayUnit.value),
      y: plotData.map(row => row[s]),
      type: 'scatter',
      mode: 'lines',
      name: s + ' 振幅',
      line: { color: colors[idx % colors.length] }
    })
    if (showMA) {
      traces.push({
        x: plotData.map(row => row.freq / displayUnit.value),
        y: plotData.map(row => row[s + '_MA']),
        type: 'scatter',
        mode: 'lines',
        name: s + ' 移動平均',
        line: { color: colors[(idx + 8) % colors.length], dash: 'dash' }
      })
    }
  })

  return (
    <>
      <SParamSelector sParams={sParams} selected={selected} onChange={s => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
      <FreqUnitSelector displayUnit={displayUnit} setDisplayUnit={setDisplayUnit} />
      <MovingAverageControl showMA={showMA} setShowMA={setShowMA} maWindow={maWindow} setMaWindow={setMaWindow} maxWindow={chartData.length} />
      {selected.length > 0 && (
        <Plot
          data={traces}
          layout={{
            autosize: true,
            height: 400,
            xaxis: { title: { text: freqLabel } },
            yaxis: { title: { text: yLabel } },
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
