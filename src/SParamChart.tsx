import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { TouchstoneData } from './parseTouchstone'

export interface SParamChartProps {
  touchstone: TouchstoneData
}

const colors = [
  '#8884d8', '#82ca9d', '#ff7300', '#ff0000', '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#A28FD0', '#F67280', '#355C7D', '#6C5B7B', '#C06C84', '#F8B195', '#355C7D', '#99B898'
]

const freqUnitOptions = [
  { label: 'GHz', value: 1e9 },
  { label: 'MHz', value: 1e6 },
  { label: 'kHz', value: 1e3 },
  { label: 'Hz', value: 1 },
]

export function SParamChart({ touchstone }: SParamChartProps) {
  const { sParamMap, format, freqUnit } = touchstone
  const sParams = Array.from(sParamMap.keys())
  const [selected, setSelected] = useState<string[]>(sParams.slice(0, 1))
  // ユーザーが選択する表示単位
  const defaultUnit = freqUnitOptions.find(u => u.label.toUpperCase() === freqUnit) || freqUnitOptions[0]
  const [displayUnit, setDisplayUnit] = useState(defaultUnit)

  const handleCheck = (s: string) => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  // recharts用データ整形（freqごとにまとめる）
  const chartData: Record<string, number>[] = []
  if (sParams.length > 0) {
    const base = sParamMap.get(sParams[0]) || []
    for (let i = 0; i < base.length; ++i) {
      const obj: Record<string, number> = { freq: base[i].freq }
      for (const s of sParams) {
        const arr = sParamMap.get(s)
        if (arr && arr[i]) obj[s] = arr[i].value
      }
      chartData.push(obj)
    }
  }

  // Y軸ラベル
  const yLabel = format === 'DB' ? 'Magnitude [dB]' : 'Magnitude'
  const freqLabel = `Frequency [${displayUnit.label}]`

  return (
    <>
      <div style={{ margin: '12px 0' }}>
        <label>表示Sパラメータ: </label>
        {sParams.map(s => (
          <label key={s} style={{ marginRight: 8 }}>
            <input
              type="checkbox"
              checked={selected.includes(s)}
              onChange={() => handleCheck(s)}
            />
            {s}
          </label>
        ))}
      </div>
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
      {selected.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
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
          </LineChart>
        </ResponsiveContainer>
      )}
    </>
  )
}
