import { useState } from 'react'
import Plot from 'react-plotly.js'
import type { ScatterData, PlotData } from 'plotly.js'

export interface SParamChartProps {
  traces: Partial<ScatterData>[]
  format: string // 追加
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

function SParamSelector({ traces, selected, onChange }: { traces: Partial<ScatterData>[]; selected: string[]; onChange: (s: string) => void }) {
  const sParams = traces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean)
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

export function SParamChart({ traces, format }: SParamChartProps) {
  const sParams = traces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean)
  const [selected, setSelected] = useState<string[]>(sParams.slice(0, 1))
  const [showMA, setShowMA] = useState(false)
  // formatに応じてyLabelを切り替え
  const yLabel = format === 'DB' ? 'dB' : 'Magnitude'
  const [maWindow, setMaWindow] = useState(5)

  let plotData = traces.filter(t => typeof t.name === 'string' && selected.includes(t.name))
  plotData = plotData.map(t => {
    if (Array.isArray(t.x)) {
      // formatに応じてhovertemplateを切り替え
      const hovertemplate = format === 'DB'
        ? `%{x:.2s}Hz<br>%{y:.3f} dB <extra></extra>`
        : `%{x:.2s}Hz<br>%{y:.3f} <extra></extra>`
      return {
        ...t,
        hovertemplate
      }
    }
    return t
  })
  if (showMA) {
    const maTraces = plotData
      .filter(t => Array.isArray(t.x) && t.x.every(v => typeof v === 'number'))
      .map(t => {
        const yArray = Array.isArray(t.y) && t.y.every((v) => typeof v === 'number') ? t.y : [];
        const movingAvg = movingAverage(yArray, maWindow)
        // 移動平均trace生成時の型エラー解消のため、リテラル型推論を利用
        const scatterType = 'scatter'; // 'scatter' as const ではなく、型アサーション禁止のためconstでリテラル型推論
        const lineMode = 'lines';
        const dashDot = 'dot';

        const movingAvgTrace: Partial<PlotData> = {
          x: t.x,
          y: movingAvg,
          type: scatterType,
          mode: lineMode,
          name: `${t.name} (移動平均)`,
          line: { dash: dashDot },
          hovertemplate: t.hovertemplate,
        }
        return movingAvgTrace
      })
    plotData = [...plotData, ...maTraces]
  }

  return (
    <>
      <SParamSelector traces={traces} selected={selected} onChange={s => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
      <MovingAverageControl
        showMA={showMA}
        setShowMA={setShowMA}
        maWindow={maWindow}
        setMaWindow={setMaWindow}
        maxWindow={(() => {
          const first = plotData[0]
          if (
            first &&
            Array.isArray(first.x) &&
            first.x.every(v => typeof v === 'number')
          ) {
            return first.x.length
          }
          return 1
        })()}
      />
      {selected.length > 0 && (
        <Plot
          data={plotData}
          layout={{
            autosize: true,
            height: 400,
            xaxis: {
              title: { text: 'Frequency [Hz]' },
              tickformat: '~s',
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
