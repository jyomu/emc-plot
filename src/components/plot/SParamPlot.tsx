import { useProcessedTraces } from '../../hooks/useProcessedTraces'
import type { ProcessedTracesMode } from '../../hooks/useProcessedTraces'
import { usePlotProcess } from '../../hooks/usePlotProcess'
import { usePostProcessControls } from '../../hooks/useProcessControls'
import { PreprocessControls } from './PreprocessControls'
import { PostprocessControls } from './PostprocessControls'
import Plot from 'react-plotly.js'
import { useMemo } from 'react'
import { movingAverage } from '../../utils/chartUtils'
import type { PartialPlotData } from '../../types/plot'
import type { Layout } from 'plotly.js'

export type PlotSpace = 'frequency' | 'time' | 'cepstrum' | 'none'

function getLayoutForSpace(space: PlotSpace): Partial<Layout> {
  const base: Partial<Layout> = {
    autosize: true,
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    font: { color: 'black' },
    height: 400,
    legend: { orientation: 'h' },
    margin: { t: 30, l: 60, r: 30, b: 60 }
  } as const
  switch (space) {
    case 'time':
      return { ...base, xaxis: { title: { text: 'Time [s]' }, tickformat: '~s', ticksuffix: 's' }, yaxis: { title: { text: 'Amplitude' }, tickformat: '~s' } }
    case 'frequency':
      return { ...base, xaxis: { title: { text: 'Frequency [Hz]' }, tickformat: '~s', ticksuffix: 'Hz' }, yaxis: { title: { text: 'Amplitude' }, tickformat: '~s' } }
    case 'cepstrum':
      return { ...base, xaxis: { title: { text: 'Quefrency [s]' }, tickformat: '~s', ticksuffix: 's' }, yaxis: { title: { text: 'Cepstrum' }, tickformat: '~s' } }
    case 'none':
    default:
      return { ...base, xaxis: { title: { text: 'Index' } }, yaxis: { title: { text: 'Value' } } }
  }
}

export function SParamPlot(props: { type: ProcessedTracesMode, title?: string, space?: PlotSpace }) {
  const { type, title, space = 'none' } = props
  const { state: postProcessState } = usePostProcessControls()
  const isProcessed = type === 'dft' || type === 'idft'
  const processType = isProcessed ? type : 'dft'
  const process = usePlotProcess(processType)
  const traces = useProcessedTraces(type)

  const plotData: PartialPlotData[] = useMemo(() => {
    let data = traces.slice()
    
    if (postProcessState.showMA && postProcessState.maWindow && data.length > 0) {
      const maTraces = data.map(t => ({
        x: t.x,
        y: movingAverage(t.y, postProcessState.maWindow),
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: t.name ? `${t.name} (MA)` : 'Moving Average',
        line: { dash: 'dash' as const },
      }))
      data = [...data, ...maTraces]
    }
    return data
  }, [traces, postProcessState.showMA, postProcessState.maWindow])

  return (
    <div>
      {title && <div className="font-bold mb-1 flex items-center gap-2">{title}</div>}
      {isProcessed && (
        <>
          <div className="font-bold mb-1 flex items-center gap-2">
            {process.process.label}
            <PreprocessControls processType={processType} />
          </div>
        </>
      )}
      <PostprocessControls />
      <Plot
        data={plotData}
        layout={getLayoutForSpace(space)}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        config={{ responsive: true, editable: true }}
      />
    </div>
  )
}
