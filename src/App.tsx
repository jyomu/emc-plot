import { useState } from 'react'
import { parseTouchstone } from './parseTouchstone'
import { SParamChart } from './SParamChart'
import './App.css'
import type { PlotData } from 'plotly.js'

function App() {
  const [traces, setTraces] = useState<Partial<PlotData>[] | null>(null)
  const [format, setFormat] = useState<'DB' | 'MA' | 'RI'>('DB')
  const [error, setError] = useState<string | null>(null)

  return (
    <div style={{ padding: 24 }}>
      <h1>Touchstone Sパラメータプロッタ (nポート対応)</h1>
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
        <SParamChart traces={traces} format={format} />
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}

export default App
