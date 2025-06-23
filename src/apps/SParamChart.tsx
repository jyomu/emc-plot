import { useState } from 'react'
import type { PartialPlotData } from '../types/plot'
import { SParamSelector } from '../components/SParamSelector'
import { TabContent } from '../components/TabContent'
import { parseTouchstone } from '../utils/parseTouchstone'
import { calcAmplitudeSpectrumTrace, calcCepstrumTrace } from '../utils/fftUtils'

export function SParamChart() {
  const [traces, setTraces] = useState<PartialPlotData[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  const selectedTraces = traces ? traces.filter(t => typeof t.name === 'string' && selected.includes(t.name)) : []
  const spectrumTraces = selectedTraces.map(t => calcAmplitudeSpectrumTrace(t))
  const cepstrumTraces = selectedTraces.map(t => calcCepstrumTrace(t))

  return (
    <>
      <input type="file" accept=".snp,.s2p,.s3p,.s4p" onChange={async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
          const traces = await parseTouchstone(file)
          setTraces(traces)
          setSelected(traces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean).slice(0, 1))
          setError(null)
        } catch (err) {
          setError('パースエラー: ' + (err instanceof Error ? err.message : String(err)))
        }
      }} />
      {traces && (
        <>
          <SParamSelector traces={traces} selected={selected} onChange={(s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
          <TabContent spectrum={spectrumTraces} cepstrum={cepstrumTraces} />
        </>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </>
  )
}
