import { useState } from 'react'
import type { PartialPlotData } from './types/plot'
import { parseTouchstone } from './utils/parseTouchstone'
import { SParamChart } from './apps/SParamChart'
import './App.css'

function App() {
  const [traces, setTraces] = useState<PartialPlotData[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div style={{ padding: 24 }}>
      <h1>Touchstone Sパラメータプロッタ (nポート対応)</h1>
      <input type="file" accept=".snp,.s2p,.s3p,.s4p" onChange={async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
          const traces = await parseTouchstone(file)
          setTraces(traces)
          setError(null)
        } catch (err) {
          setError('パースエラー: ' + (err instanceof Error ? err.message : String(err)))
        }
      }} />
      {traces && (
        <SParamChart traces={traces} />
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}

export default App
