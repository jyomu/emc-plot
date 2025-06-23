import { useState } from 'react'
import type { PartialPlotData } from './types/plot'
import { parseTouchstone } from './utils/parseTouchstone'
import { SParamChart } from './apps/SParamChart'
import './App.css'

const CONVERTER_TYPES = [
  { key: 'time', label: 'Time Domain Waveform Converter / Spectrum & Cepstrum' },
  { key: 'touchstone', label: 'Touchstone S-parameter Converter' },
] as const

type ConverterType = typeof CONVERTER_TYPES[number]['key']

function App() {
  const [traces, setTraces] = useState<PartialPlotData[] | null>(null)
  const [format, setFormat] = useState<'DB' | 'MA' | 'RI'>('DB')
  const [error, setError] = useState<string | null>(null)
  const [converterType, setConverterType] = useState<ConverterType>('touchstone')

  return (
    <div style={{ padding: 24 }}>
      <h1>Touchstone Sパラメータプロッタ (nポート対応)</h1>
      <div style={{ margin: '12px 0' }}>
        <label>コンバータ種別: </label>
        <select value={converterType} onChange={e => {
          const v = e.target.value
          if (v === 'time' || v === 'touchstone') setConverterType(v)
        }}>
          {CONVERTER_TYPES.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>
      {converterType === 'touchstone' && (
        <>
          <input type="file" accept=".snp,.s2p,.s3p,.s4p" onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            try {
              const parsed = await parseTouchstone(file)
              setTraces(parsed.traces)
              setFormat(parsed.format)
              setError(null)
            } catch (err) {
              setError('パースエラー: ' + (err instanceof Error ? err.message : String(err)))
            }
          }} />
          {traces && (
            <SParamChart traces={traces} format={format} converterType={converterType} />
          )}
        </>
      )}
      {converterType === 'time' && (
        <div style={{ margin: '12px 0', color: '#888' }}>
          Time Domain Waveform Converter / Spectrum & Cepstrum のUI・処理は今後実装予定です。
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}

export default App
