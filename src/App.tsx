import { useState } from 'react'
import { parseTouchstone, type TouchstoneData } from './parseTouchstone'
import { SParamChart } from './SParamChart'
import './App.css'

function App() {
  const [touchstone, setTouchstone] = useState<TouchstoneData | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div style={{ padding: 24 }}>
      <h1>Touchstone Sパラメータプロッタ (nポート対応)</h1>
      <input type="file" accept=".snp,.s2p,.s3p,.s4p" onChange={async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
          const parsed = await parseTouchstone(file)
          setTouchstone(parsed)
          setError(null)
        } catch (err) {
          setError('パースエラー: ' + (err as Error).message)
        }
      }} />
      {touchstone && (
        <SParamChart touchstone={touchstone} />
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}

export default App
