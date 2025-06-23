import { useState } from 'react'
import type { PartialPlotData } from '../types/plot'
import { SParamSelector } from '../components/SParamSelector'
import { PlotArea } from '../components/PlotArea'
import { parseTouchstone } from '../utils/parseTouchstone'
import { calcCepstrumTrace, calcIFFTTrace } from '../utils/fftUtils'

const tabDefs = [
  { key: 'spectrum', label: 'スペクトラム' },
  { key: 'time', label: '時系列（IFFT）' },
  { key: 'cepstrum', label: 'ケプストラム' },
] as const

type TabKey = typeof tabDefs[number]['key']

export function SParamChart() {
  const [traces, setTraces] = useState<PartialPlotData[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [tab, setTab] = useState<TabKey>('spectrum')

  const selectedTraces = traces ? traces.filter(t => typeof t.name === 'string' && selected.includes(t.name)) : []
  const spectrumTraces = selectedTraces // そのまま周波数領域データとして使う
  const cepstrumTraces = selectedTraces.map(t => calcCepstrumTrace(t))
  const timeTraces = selectedTraces.map(t => calcIFFTTrace(t))

  let content = null
  if (tab === 'spectrum') {
    content = <PlotArea space="frequency" data={spectrumTraces} />
  } else if (tab === 'time') {
    content = <PlotArea space="time" data={timeTraces} />
  } else if (tab === 'cepstrum') {
    content = <PlotArea space="cepstrum" data={cepstrumTraces} />
  }

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
          <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
            {tabDefs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} disabled={tab === t.key}>{t.label}</button>
            ))}
          </div>
          <div style={{ marginBottom: 24 }}>
            {content}
          </div>
        </>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </>
  )
}
