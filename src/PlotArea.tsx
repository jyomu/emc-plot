import Plot from 'react-plotly.js'
import type { PlotData } from 'plotly.js'

// 空間ごとの型
type TimeDomainData = { t: number[]; y: number[] }
type FrequencyDomainData = { f: number[]; Y: number[]; isLog?: boolean }
type CepstrumDomainData = { q: number[]; C: number[] }

// 複数系列一括描画用
export type MultiPlotAreaProps = { plotData: Partial<PlotData>[]; xLabel?: string; yLabel?: string }

type PlotAreaProps =
  | { space: 'time'; data: TimeDomainData; xLabel?: string; yLabel?: string }
  | { space: 'frequency'; data: FrequencyDomainData; xLabel?: string; yLabel?: string }
  | { space: 'cepstrum'; data: CepstrumDomainData; xLabel?: string; yLabel?: string }
  | MultiPlotAreaProps

export function PlotArea(props: PlotAreaProps) {
  let plotData: Partial<PlotData>[] = []
  let defaultXLabel = ''
  let defaultYLabel = ''

  if ('plotData' in props) {
    plotData = props.plotData
    defaultXLabel = props.xLabel ?? ''
    defaultYLabel = props.yLabel ?? ''
  } else if (props.space === 'time') {
    plotData = [{ x: props.data.t, y: props.data.y, type: 'scatter', mode: 'lines', name: 'Time' }]
    defaultXLabel = 'Time [s]'
    defaultYLabel = 'Amplitude'
  } else if (props.space === 'frequency') {
    plotData = [{
      x: props.data.f,
      y: props.data.Y,
      type: 'scatter',
      mode: 'lines',
      name: props.data.isLog ? 'Log Spectrum' : 'Spectrum'
    }]
    defaultXLabel = 'Frequency [Hz]'
    defaultYLabel = props.data.isLog ? 'log Amplitude' : 'Amplitude'
  } else if (props.space === 'cepstrum') {
    plotData = [{ x: props.data.q, y: props.data.C, type: 'scatter', mode: 'lines', name: 'Cepstrum' }]
    defaultXLabel = 'Quefrency [s]'
    defaultYLabel = 'Cepstrum'
  }

  return (
    <Plot
      data={plotData}
      layout={{
        autosize: true,
        height: 400,
        xaxis: { title: { text: props.xLabel ?? defaultXLabel } },
        yaxis: { title: { text: props.yLabel ?? defaultYLabel } },
        legend: { orientation: 'h' },
        margin: { t: 30, l: 60, r: 30, b: 60 }
      }}
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
      config={{ responsive: true }}
    />
  )
}
