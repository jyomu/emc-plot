import { TouchstoneChart } from './TouchstoneChart'
import type { PlotData } from 'plotly.js'

export interface SParamChartProps {
  traces: Partial<PlotData>[]
  format: 'DB' | 'MA' | 'RI'
  converterType: 'time' | 'touchstone'
}

export function SParamChart({ traces, format, converterType }: SParamChartProps) {
  if (converterType === 'touchstone') {
    return <TouchstoneChart traces={traces} format={format} />
  }
  if (converterType === 'time') {
    return (
      <>
        <div style={{ margin: '12px 0', color: '#888' }}>
          Time Domain Waveform Converter / Spectrum & Cepstrum のUI・処理は今後実装予定です。
        </div>
      </>
    )
  }
  return null
}
