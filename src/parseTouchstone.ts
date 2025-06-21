export interface TouchstoneData {
  chartData: Array<Record<string, number>> // freq, S11, S21, ...
  sParams: string[]
  nPorts: number
  freqUnit: string
  format: string
  z0: number
}

export async function parseTouchstone(file: File): Promise<TouchstoneData> {
  const text: string = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
  const filename = file.name
  const lines = text.split(/\r?\n/)
  // ヘッダ解析
  const headerInfo = (() => {
    let freqUnit: string | undefined, format: string | undefined, z0: number | undefined
    for (const line of lines) {
      const l = line.trim()
      if (l === '' || l.startsWith('!')) continue
      if (l.startsWith('#')) {
        const parts = l.split(/\s+/).map(x => x.toUpperCase())
        const freqUnitIdx = parts.findIndex(p => ['GHZ','MHZ','KHZ','HZ'].includes(p))
        freqUnit = freqUnitIdx >= 0 ? parts[freqUnitIdx] : undefined
        const formatIdx = parts.findIndex(p => ['DB','MA','RI'].includes(p))
        format = formatIdx >= 0 ? parts[formatIdx] : undefined
        const z0idx = parts.findIndex(p => p === 'R')
        z0 = (z0idx >= 0 && parts[z0idx + 1]) ? Number(parts[z0idx + 1]) : undefined
        break
      }
    }
    if (!freqUnit) throw new Error('ヘッダに周波数単位(GHZ/MHZ/KHZ/HZ)がありません')
    if (!format) throw new Error('ヘッダにデータフォーマット(DB/MA/RI)がありません')
    if (z0 === undefined) throw new Error('ヘッダに基準インピーダンス(R xx)がありません')
    return { freqUnit, format, z0 }
  })()
  const { freqUnit, format, z0 } = headerInfo
  let nPorts: number | undefined = undefined
  // ファイル名からnPorts取得
  if (filename) {
    const m = filename.match(/\.s(\d+)p$/i)
    if (m) {
      nPorts = parseInt(m[1], 10)
    }
  }
  // データ部の抽出（折り返し対応）
  const dataLines: string[] = []
  let current = ''
  for (const line of lines) {
    const l = line.trim()
    if (l === '' || l.startsWith('!') || l.startsWith('#')) continue
    current += (current ? ' ' : '') + l
    // Touchstoneは折り返し時、次の行も数値で始まるとは限らない
    // 1行に十分な数値が揃ったらpush
    // まずポート数が分からない場合は暫定で1行ごとにpush
    if (nPorts === undefined) {
      dataLines.push(current)
      current = ''
    } else {
      // 1サンプル: freq + n^2*2
      const expected = 1 + nPorts * nPorts * 2
      const nums = current.split(/\s+/).filter(x => x.match(/[-+]?\d/))
      if (nums.length >= expected) {
        dataLines.push(current)
        current = ''
      }
    }
  }
  if (current) dataLines.push(current)
  // データ部をすべて連結して数値配列化
  const allNums = dataLines.join(' ').split(/\s+/).map(Number).filter(x => !isNaN(x))
  // ポート数推定
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
  const chartData: Array<Record<string, number>> = []
  const sParams: string[] = []
  for (let i = 1; i <= nPorts; ++i) {
    for (let j = 1; j <= nPorts; ++j) {
      sParams.push(`S${i}${j}`)
    }
  }
  for (let s = 0; s < nSamples; ++s) {
    const base = s * sampleLen
    const freq =
      freqUnit === 'GHZ' ? allNums[base] * 1e9 :
      freqUnit === 'MHZ' ? allNums[base] * 1e6 :
      freqUnit === 'KHZ' ? allNums[base] * 1e3 :
      allNums[base]
    const row: Record<string, number> = { freq }
    for (let i = 1; i <= nPorts; ++i) {
      for (let j = 1; j <= nPorts; ++j) {
        const idx = base + 1 + ((i - 1) * nPorts + (j - 1)) * 2
        let mag = allNums[idx]
        const phase = allNums[idx + 1]
        // DB, MA, RI対応
        if (format === 'DB') {
          mag = Math.pow(10, mag / 20)
        } else if (format === 'RI') {
          // 実部・虚部→振幅
          mag = Math.sqrt(mag * mag + phase * phase)
        }
        row[`S${i}${j}`] = mag
      }
    }
    chartData.push(row)
  }
  return { chartData, sParams, nPorts, freqUnit, format, z0 }
}
