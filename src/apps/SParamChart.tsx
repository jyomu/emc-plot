import { useState, useMemo } from 'react'
import type { PartialPlotData } from '../types/plot'
import { SParamSelector } from '../components/SParamSelector'
import { TabContent } from '../components/TabContent'
import { calcAmplitudeSpectrumTrace, calcCepstrumTrace } from '../utils/fftUtils'

export interface SParamChartProps {
  traces: PartialPlotData[]
}

export function SParamChart({ traces }: SParamChartProps) {
  const sParams = traces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean)
  const [selected, setSelected] = useState<string[]>(sParams.slice(0, 1))

  const selectedTraces = useMemo(() => {
    return traces.filter(t => typeof t.name === 'string' && selected.includes(t.name))
  }, [traces, selected])

  const spectrumTraces = useMemo(() =>
    selectedTraces.map(t => calcAmplitudeSpectrumTrace(t))
  , [selectedTraces])

  const cepstrumTraces = useMemo(() =>
    selectedTraces.map(t => calcCepstrumTrace(t))
  , [selectedTraces])

  return (
    <>
      <SParamSelector traces={traces} selected={selected} onChange={(s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
      <TabContent spectrum={spectrumTraces} cepstrum={cepstrumTraces} />
    </>
  )
}
