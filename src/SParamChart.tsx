import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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

  return (
    <>
      <SParamSelector sParams={sParams} selected={selected} onChange={s => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
      <FreqUnitSelector displayUnit={displayUnit} setDisplayUnit={setDisplayUnit} />
      <MovingAverageControl showMA={showMA} setShowMA={setShowMA} maWindow={maWindow} setMaWindow={setMaWindow} maxWindow={chartData.length} />
      {selected.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={showMA ? maData : chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="freq"
              tickFormatter={v => (v/displayUnit.value).toFixed(2)}
              label={{ value: freqLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(v: number) => v.toPrecision(4)} labelFormatter={v => (v/displayUnit.value).toFixed(2) + ` ${displayUnit.label}`} />
            <Legend />
            {selected.map((s, idx) => (
              <Line
                key={s}
                type="monotone"
                dataKey={s}
                stroke={colors[idx % colors.length]}
                name={s + ' 振幅'}
                dot={false}
              />
            ))}
            {showMA && selected.map((s, idx) => (
              <Line
                key={s + '_MA'}
                type="monotone"
                dataKey={s + '_MA'}
                stroke={colors[(idx + 8) % colors.length]}
                name={s + ' 移動平均'}
                dot={false}
                strokeDasharray="5 2"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </>
  )
}
