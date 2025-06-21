import { useState } from 'react'
import Plot from 'react-plotly.js'
import type { PlotData } from 'plotly.js'
import { calcFFT, calcCepstrum } from './fftUtils'

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

function SParamSelector({ traces, selected, onChange }: { traces: Partial<PlotData>[]; selected: string[]; onChange: (s: string) => void }) {
  const sParams = traces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean)
  return (
    <div style={{ margin: '12px 0' }}>
      <label>表示Sパラメータ: </label>
      {sParams.map((s: string) => (
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

const TABS = [
  { key: 'raw', label: 'Sパラメータ' },
  { key: 'fft', label: 'スペクトラム' },
  { key: 'cep', label: 'ケプストラム' },
] as const

type TabKey = typeof TABS[number]['key']

function getMaxMAWindow(plotData: Partial<PlotData>[]): number {
  const first = plotData[0]
  if (
    first &&
    Array.isArray(first.x) &&
    first.x.every(v => typeof v === 'number')
  ) {
    return first.x.length
  }
  return 1
}

function MovingAverageControl({ showMA, setShowMA, maWindow, setMaWindow, maxWindow }: {
  showMA: boolean
  setShowMA: (b: boolean) => void
  maWindow: number
  setMaWindow: (n: number) => void
  maxWindow: number
}) {
  return (
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
  )
}

interface TouchstoneChartProps {
  traces: Partial<PlotData>[]
  format: 'DB' | 'MA' | 'RI'
}

export function TouchstoneChart({ traces, format }: TouchstoneChartProps) {
  const sParams = traces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean)
  const [selected, setSelected] = useState<string[]>(sParams.slice(0, 1))
  const [showMA, setShowMA] = useState(false)
  const [maWindow, setMaWindow] = useState(50)
  const [activeTab, setActiveTab] = useState<TabKey>('raw')
  const yLabel = format === 'DB' ? 'dB' : 'Magnitude'

  let plotData: Partial<PlotData>[] = []
  let yLabelOverride = yLabel
  let xLabelOverride = 'Frequency [Hz]'

  const baseTraces = traces.filter(t => typeof t.name === 'string' && selected.includes(t.name)).map(t => {
    if (Array.isArray(t.x)) {
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


  function getNumberArray(arr: unknown): number[] {
    return Array.isArray(arr) ? arr.filter((v): v is number => typeof v === 'number') : []
  }

  function makePlotTraces({
    traces,
    selected,
    yTransform,
    xTransform,
    nameSuffix,
    lineDash,
    hovertemplate,
  }: {
    traces: Partial<PlotData>[];
    selected: string[];
    yTransform: (y: number[]) => number[];
    xTransform: (t: Partial<PlotData>, y: number[]) => number[];
    nameSuffix: string;
    lineDash: 'solid' | 'dash' | 'dot' | 'dashdot' | 'longdash';
    hovertemplate: string;
  }) {
    return traces
      .filter(t => typeof t.name === 'string' && selected.includes(t.name))
      .filter(t => Array.isArray(t.x) && t.x.every(v => typeof v === 'number'))
      .map(t => {
        const yArray = getNumberArray(t.y)
        const y = yTransform(yArray)
        const x = xTransform(t, y)
        return {
          x,
          y,
          type: 'scatter' as const,
          mode: 'lines' as const,
          name: `${t.name}${nameSuffix}`,
          line: { dash: lineDash },
          hovertemplate,
        }
      })
  }

  if (activeTab === 'raw') {
    xLabelOverride = 'Frequency [Hz]'
    yLabelOverride = format === 'DB' ? 'dB' : 'Magnitude'
    plotData = makePlotTraces({
      traces: baseTraces,
      selected,
      yTransform: y => y,
      xTransform: t => getNumberArray(t.x),
      nameSuffix: '',
      lineDash: 'solid',
      hovertemplate: format === 'DB'
        ? `%{x:.2s}Hz<br>%{y:.3f} dB <extra></extra>`
        : `%{x:.2s}Hz<br>%{y:.3f} <extra></extra>`
    })
    if (showMA) {
      plotData = [
        ...plotData,
        ...makePlotTraces({
          traces: baseTraces,
          selected,
          yTransform: y => movingAverage(y, maWindow),
          xTransform: t => getNumberArray(t.x),
          nameSuffix: ' (移動平均)',
          lineDash: 'dash',
          hovertemplate: format === 'DB'
            ? `%{x:.2s}Hz<br>%{y:.3f} dB <extra></extra>`
            : `%{x:.2s}Hz<br>%{y:.3f} <extra></extra>`
        })
      ]
    }
  } else if (activeTab === 'fft') {
    xLabelOverride = 'Frequency [Hz]'
    yLabelOverride = 'Amplitude'
    plotData = makePlotTraces({
      traces: baseTraces,
      selected,
      yTransform: y => calcFFT(y),
      xTransform: (t, y) => {
        const xArr = getNumberArray(t.x)
        if (xArr.length > 1) {
          const dt = xArr[1] - xArr[0]
          const Fs = 1 / dt
          const N = y.length * 2
          return Array.from({length: y.length}, (_, i) => i * Fs / N)
        }
        return Array.from({length: y.length}, (_, i) => i)
      },
      nameSuffix: ' (FFT of 元データ)',
      lineDash: 'dot',
      hovertemplate: `%{x:.2s}Hz<br>%{y:.3f} <extra></extra>`
    })
    if (showMA) {
      plotData = [
        ...plotData,
        ...makePlotTraces({
          traces: baseTraces,
          selected,
          yTransform: y => calcFFT(movingAverage(y, maWindow)),
          xTransform: (t, y) => {
            const xArr = getNumberArray(t.x)
            if (xArr.length > 1) {
              const dt = xArr[1] - xArr[0]
              const Fs = 1 / dt
              const N = y.length * 2
              return Array.from({length: y.length}, (_, i) => i * Fs / N)
            }
            return Array.from({length: y.length}, (_, i) => i)
          },
          nameSuffix: ' (FFT of 移動平均)',
          lineDash: 'dashdot',
          hovertemplate: `%{x:.2s}Hz<br>%{y:.3f} <extra></extra>`
        })
      ]
    }
  } else if (activeTab === 'cep') {
    xLabelOverride = 'Quefrency [s]'
    yLabelOverride = 'Cepstrum'
    plotData = makePlotTraces({
      traces: baseTraces,
      selected,
      yTransform: y => calcCepstrum(y),
      xTransform: (t, y) => {
        const xArr = getNumberArray(t.x)
        if (xArr.length > 1) {
          const dt = xArr[1] - xArr[0]
          return Array.from({length: y.length}, (_, i) => i * dt)
        }
        return Array.from({length: y.length}, (_, i) => i)
      },
      nameSuffix: ' (Cepstrum of 元データ)',
      lineDash: 'longdash',
      hovertemplate: `%{x}<br>%{y:.3f} <extra></extra>`
    })
    if (showMA) {
      plotData = [
        ...plotData,
        ...makePlotTraces({
          traces: baseTraces,
          selected,
          yTransform: y => calcCepstrum(movingAverage(y, maWindow)),
          xTransform: (t, y) => {
            const xArr = getNumberArray(t.x)
            if (xArr.length > 1) {
              const dt = xArr[1] - xArr[0]
              return Array.from({length: y.length}, (_, i) => i * dt)
            }
            return Array.from({length: y.length}, (_, i) => i)
          },
          nameSuffix: ' (Cepstrum of 移動平均)',
          lineDash: 'dashdot',
          hovertemplate: `%{x}<br>%{y:.3f} <extra></extra>`
        })
      ]
    }
  }

  return (
    <>
      <SParamSelector traces={traces} selected={selected} onChange={(s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
      <div style={{ margin: '12px 0' }}>
        {TABS.map((tab: { key: TabKey; label: string }) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              marginRight: 8,
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              background: activeTab === tab.key ? '#e0e0e0' : undefined
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* タブごとにグラフ＋移動平均コントロールをまとめて表示 */}
      <div>
        {selected.length > 0 && plotData.length > 0 && (
          <>
            <Plot
              data={plotData}
              layout={{
                autosize: true,
                height: 400,
                xaxis: {
                  title: { text: xLabelOverride },
                  tickformat: '~s',
                  ticksuffix: activeTab === 'fft' ? 'Hz' : (activeTab === 'raw' ? 'Hz' : ''),
                },
                yaxis: {
                  title: { text: yLabelOverride },
                  tickformat: '.3f',
                },
                legend: { orientation: 'h' },
                margin: { t: 30, l: 60, r: 30, b: 60 }
              }}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
              config={{ responsive: true }}
            />
            <div style={{ marginTop: 8 }}>
              <MovingAverageControl
                showMA={showMA}
                setShowMA={setShowMA}
                maWindow={maWindow}
                setMaWindow={setMaWindow}
                maxWindow={getMaxMAWindow(plotData)}
              />
            </div>
          </>
        )}
      </div>
    </>
  )
}
