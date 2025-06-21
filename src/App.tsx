import { useState } from 'react'
import './App.css'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// nポートTouchstoneパーサ（コメント・非数値行を厳密に無視）
function parseTouchstone(text: string, filename?: string) {
  const lines = text.split(/\r?\n/)
  let freqUnit = 'GHz'
  let format = 'MA' // 振幅・位相
  let nPorts: number | undefined = undefined
  // ファイル名からnPorts取得
  if (filename) {
    const m = filename.match(/\.s(\d+)p$/i)
    if (m) {
      nPorts = parseInt(m[1], 10)
    }
  }
  let dataLines: string[] = []
  // ヘッダ解析
  for (const line of lines) {
    const l = line.trim()
    if (l === '' || l.startsWith('!')) continue
    if (l.startsWith('#')) {
      const parts = l.split(/\s+/)
      freqUnit = parts[1] || 'GHz'
      format = parts[3] || 'MA'
      continue
    }
    // 先頭が数値で始まる行のみデータとして扱う
    if (/^[-+]?\d/.test(l)) {
      dataLines.push(l)
    }
  }
  // データ部をすべて連結して数値配列化
  const allNums = dataLines.join(' ').split(/\s+/).map(Number).filter(x => !isNaN(x))
  // ポート数推定
  // 1サンプル: freq + n^2*2
  // サンプル数 = floor(allNums.length / (1 + n^2*2))
  let found = false
  if (nPorts === undefined) {
    for (let n = 1; n <= 10; ++n) {
      const sampleLen = 1 + n * n * 2
      if (allNums.length % sampleLen === 0) {
        nPorts = n
        found = true
        break
      }
    }
    if (!found || nPorts === undefined) throw new Error('ポート数の自動推定に失敗しました')
  }
  // ここからはnPortsは必ずnumber
  const sampleLen = 1 + nPorts * nPorts * 2
  const nSamples = Math.floor(allNums.length / sampleLen)
  const data: Record<string, number>[] = []
  for (let s = 0; s < nSamples; ++s) {
    const base = s * sampleLen
    const freq =
      freqUnit === 'GHz' ? allNums[base] * 1e9 :
      freqUnit === 'MHz' ? allNums[base] * 1e6 :
      freqUnit === 'kHz' ? allNums[base] * 1e3 :
      allNums[base]
    const row: Record<string, number> = { freq }
    for (let i = 1; i <= nPorts; ++i) {
      for (let j = 1; j <= nPorts; ++j) {
        const idx = base + 1 + ((i - 1) * nPorts + (j - 1)) * 2
        let mag = allNums[idx]
        // let phase = allNums[idx + 1]
        if (format === 'DB') {
          mag = Math.pow(10, mag / 20)
        }
        row[`S${i}${j}`] = mag
      }
    }
    data.push(row)
  }
  // Sパラメータ名リストも返す
  const sParams = []
  for (let i = 1; i <= nPorts; ++i) {
    for (let j = 1; j <= nPorts; ++j) {
      sParams.push(`S${i}${j}`)
    }
  }
  return { data, sParams, nPorts }
}

function App() {
  const [data, setData] = useState<Record<string, number>[]>([])
  const [sParams, setSParams] = useState<string[]>([])
  const [selected, setSelected] = useState<string>('S21')
  const [error, setError] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = parseTouchstone(reader.result as string, file.name)
        setData(parsed.data)
        setSParams(parsed.sParams)
        setSelected(parsed.sParams[0] || '')
        setError(null)
      } catch (err) {
        setError('パースエラー: ' + (err as Error).message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Touchstone Sパラメータプロッタ (nポート対応)</h1>
      <input type="file" accept=".snp,.s2p,.s3p,.s4p,.txt" onChange={handleFile} />
      {sParams.length > 0 && (
        <div style={{ margin: '12px 0' }}>
          <label>表示Sパラメータ: </label>
          <select value={selected} onChange={e => setSelected(e.target.value)}>
            {sParams.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {data.length > 0 && selected && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="freq" tickFormatter={v => (v/1e9).toFixed(2) + ' GHz'} />
            <YAxis />
            <Tooltip formatter={(v: number) => v.toPrecision(4)} labelFormatter={v => (v/1e9).toFixed(2) + ' GHz'} />
            <Legend />
            <Line type="monotone" dataKey={selected} stroke="#8884d8" name={selected + ' 振幅'} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default App
