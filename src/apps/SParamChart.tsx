import { useState } from 'react'
import type { PartialPlotData } from '../types/plot'
import { SParamSelector } from '../components/SParamSelector'
import { PlotArea } from '../components/PlotArea'
import { parseTouchstone } from '../utils/parseTouchstone'
import { calcIFFTTrace, calcCepstrumFromSpectrumTrace } from '../utils/fftUtils'

export function SParamChart() {
  const [traces, setTraces] = useState<PartialPlotData[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  // 各空間の表示state（チェックボックスで制御）
  const [showSpectrum, setShowSpectrum] = useState(true)
  const [showTime, setShowTime] = useState(true)
  const [showCepstrum, setShowCepstrum] = useState(true)

  // 選択されたtrace（周波数領域データ）
  const spectrumTraces = traces?.filter(t => typeof t.name === 'string' && selected.includes(t.name)) ?? []
  // IFFTで時系列化
  const timeTraces = spectrumTraces.map(t => calcIFFTTrace(t))
  // ケプストラムはスペクトラム（周波数領域データ）から直接計算
  const cepstrumTraces = spectrumTraces.map(t => calcCepstrumFromSpectrumTrace(t))

  return (
    <>
      <input type="file" accept=".snp,.s2p,.s3p,.s4p" onChange={async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
          const traces = await parseTouchstone(file)
          setTraces(traces)
          setSelected(traces.map(t => typeof t.name === 'string' && t.name ? t.name : '').filter(Boolean).slice(0, 1))
          setError(null)
        } catch (err) {
          setError('パースエラー: ' + (err instanceof Error ? err.message : String(err)))
        }
      }} />
      {traces && (
        <>
          <SParamSelector traces={traces} selected={selected} onChange={(s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, margin: '24px 0' }}>
            {/* スペクトラム空間 */}
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <label>
                  <input type="checkbox" checked={showSpectrum} onChange={e => setShowSpectrum(e.target.checked)} />
                  スペクトラム
                </label>
              </div>
              {showSpectrum && <PlotArea space="frequency" data={spectrumTraces} />}
            </div>
            {/* 時系列空間 */}
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <label>
                  <input type="checkbox" checked={showTime} onChange={e => setShowTime(e.target.checked)} />
                  時系列（IFFT）
                </label>
              </div>
              {showTime && <PlotArea space="time" data={timeTraces} />}
            </div>
            {/* ケプストラム空間 */}
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <label>
                  <input type="checkbox" checked={showCepstrum} onChange={e => setShowCepstrum(e.target.checked)} />
                  ケプストラム
                </label>
              </div>
              {showCepstrum && <PlotArea space="cepstrum" data={cepstrumTraces} />}
            </div>
          </div>
        </>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </>
  )
}
