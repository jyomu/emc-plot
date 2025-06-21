import { useState } from 'react'
import Plot from 'react-plotly.js'
import type { PlotData } from 'plotly.js'
import { calcFFT, calcCepstrum } from './fftUtils'

export interface SParamChartProps {
  traces: Partial<PlotData>[]
  format: 'DB' | 'MA' | 'RI'
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

function SParamSelector({ traces, selected, onChange }: { traces: Partial<PlotData>[]; selected: string[]; onChange: (s: string) => void }) {
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

const TABS = [
  { key: 'raw', label: '元データ' },
  { key: 'fft', label: 'FFT' },
  { key: 'cep', label: 'ケプストラム' },
] as const

type TabKey = typeof TABS[number]['key']

export function SParamChart({ traces, format }: SParamChartProps) {
  const sParams = traces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean)
  const [selected, setSelected] = useState<string[]>(sParams.slice(0, 1))
  const [maWindow, setMaWindow] = useState(50)
  const [showMA, setShowMA] = useState(false)
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

  if (activeTab === 'raw') {
    plotData = [...baseTraces]
    if (showMA) {
      const maTraces = baseTraces
        .filter(t => Array.isArray(t.x) && t.x.every(v => typeof v === 'number'))
        .map(t => {
          const yArray = Array.isArray(t.y) && t.y.every((v) => typeof v === 'number') ? t.y : [];
          const movingAvg = movingAverage(yArray, maWindow)
          return {
            x: t.x,
            y: movingAvg,
            type: 'scatter' as const,
            mode: 'lines' as const,
            name: `${t.name} (移動平均)`,
            line: { dash: 'dash' as const },
            hovertemplate: t.hovertemplate,
          }
        })
      plotData = [...plotData, ...maTraces]
    }
  } else if (activeTab === 'fft') {
    plotData = baseTraces
      .filter(t => Array.isArray(t.x) && t.x.every(v => typeof v === 'number'))
      .map(t => {
        const yArray = Array.isArray(t.y) && t.y.every((v) => typeof v === 'number') ? t.y : [];
        const fft = calcFFT(yArray)
        let freq: number[] = []
        if (t.x && Array.isArray(t.x) && t.x.length > 1 && typeof t.x[0] === 'number' && typeof t.x[1] === 'number') {
          const dt = Number(t.x[1]) - Number(t.x[0])
          const Fs = 1 / dt
          const N = fft.length * 2
          freq = Array.from({length: fft.length}, (_, i) => i * Fs / N)
        } else {
          freq = Array.from({length: fft.length}, (_, i) => i)
        }
        xLabelOverride = 'Frequency [Hz]'
        yLabelOverride = 'Amplitude'
        return {
          x: freq,
          y: fft,
          type: 'scatter' as const,
          mode: 'lines' as const,
          name: `${t.name} (FFT)`,
          line: { dash: 'dot' as const },
          hovertemplate: `%{x:.2s}Hz<br>%{y:.3f} <extra></extra>`
        }
      })
  } else if (activeTab === 'cep') {
    plotData = baseTraces
      .filter(t => Array.isArray(t.x) && t.x.every(v => typeof v === 'number'))
      .map(t => {
        const yArray = Array.isArray(t.y) && t.y.every((v) => typeof v === 'number') ? t.y : [];
        const cep = calcCepstrum(yArray)
        let quefrency: number[] = []
        if (t.x && Array.isArray(t.x) && t.x.length > 1 && typeof t.x[0] === 'number' && typeof t.x[1] === 'number') {
          const dt = Number(t.x[1]) - Number(t.x[0])
          quefrency = Array.from({length: cep.length}, (_, i) => i * dt)
        } else {
          quefrency = Array.from({length: cep.length}, (_, i) => i)
        }
        xLabelOverride = 'Quefrency [s]'
        yLabelOverride = 'Cepstrum'
        return {
          x: quefrency,
          y: cep,
          type: 'scatter' as const,
          mode: 'lines' as const,
          name: `${t.name} (ケプストラム)`,
          line: { dash: 'longdash' as const },
          hovertemplate: `%{x}<br>%{y:.3f} <extra></extra>`
        }
      })
  }

  return (
    <>
      <SParamSelector traces={traces} selected={selected} onChange={s => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
      {activeTab === 'raw' && (
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
                max={(() => {
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
                value={maWindow}
                onChange={e => setMaWindow(Number(e.target.value))}
                style={{ width: 60, marginLeft: 4 }}
              />
            </span>
          )}
        </div>
      )}
      <div style={{ margin: '12px 0' }}>
        {TABS.map(tab => (
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
      {selected.length > 0 && plotData.length > 0 && (
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
      )}
    </>
  )
}
