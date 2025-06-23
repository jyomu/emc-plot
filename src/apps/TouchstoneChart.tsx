import { useState, useMemo } from 'react'
import type { PartialPlotData } from '../types/plot'
import { SParamSelector } from '../components/SParamSelector'
import { TabContent } from '../components/TabContent'
import { calcAmplitudeSpectrumTrace, calcCepstrumTrace } from '../utils/fftUtils'

type TouchstoneChartProps = {
  traces: PartialPlotData[]
  format: 'DB' | 'MA' | 'RI'
}

export function TouchstoneChart({ traces }: TouchstoneChartProps) {
  const sParams = traces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean)
  const [selected, setSelected] = useState<string[]>(sParams.slice(0, 1))

  const selectedTraces = useMemo(() => {
    return traces.filter(t => typeof t.name === 'string' && selected.includes(t.name))
  }, [traces, selected])

  const spectrumTraces = useMemo(() =>
    selectedTraces.reduce<PartialPlotData[]>((acc, t) => {
      if (t.y && Array.isArray(t.y) && t.y.every((v): v is number => typeof v === 'number')) {
        acc.push({ ...calcAmplitudeSpectrumTrace(t.y), name: t.name, type: 'scatter', mode: 'lines' })
      }
      return acc
    }, [])
  , [selectedTraces])

  const cepstrumTraces = useMemo(() =>
    selectedTraces.reduce<PartialPlotData[]>((acc, t) => {
      if (t.y && Array.isArray(t.y) && t.y.every((v): v is number => typeof v === 'number')) {
        acc.push({ ...calcCepstrumTrace(t.y), name: t.name, type: 'scatter', mode: 'lines' })
      }
      return acc
    }, [])
  , [selectedTraces])

  return (
    <>
      <SParamSelector traces={traces} selected={selected} onChange={(s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
      <TabContent spectrum={spectrumTraces} cepstrum={cepstrumTraces} />
    </>
  )
}
