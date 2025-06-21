export type ChartRow = { freq: number } & { [sParam: string]: number }

export interface TouchstoneData {
  chartData: ChartRow[]
  sParams: string[]
  nPorts: number
  freqUnit: string
  format: string
  z0: number
}

function parseHeader(lines: string[]): { freqUnit: string, format: string, z0: number } {
  for (const line of lines) {
    const l = line.trim()
    if (l === '' || l.startsWith('!')) continue
    if (l.startsWith('#')) {
      const parts = l.split(/\s+/).map(x => x.toUpperCase())
      const freqUnit = parts.find(p => ['GHZ','MHZ','KHZ','HZ'].includes(p))
      const format = parts.find(p => ['DB','MA','RI'].includes(p))
      const z0idx = parts.findIndex(p => p === 'R')
      const z0 = (z0idx >= 0 && parts[z0idx + 1]) ? Number(parts[z0idx + 1]) : undefined
      if (!freqUnit) throw new Error('ヘッダに周波数単位(GHZ/MHZ/KHZ/HZ)がありません')
      if (!format) throw new Error('ヘッダにデータフォーマット(DB/MA/RI)がありません')
      if (z0 === undefined) throw new Error('ヘッダに基準インピーダンス(R xx)がありません')
      return { freqUnit, format, z0 }
    }
  }
  throw new Error('ヘッダ行が見つかりません')
}

function extractDataLines(lines: string[], nPorts: number | undefined): string[] {
  const dataLines: string[] = []
  let current = ''
  for (const line of lines) {
    const l = line.trim()
    if (l === '' || l.startsWith('!') || l.startsWith('#')) continue
    current += (current ? ' ' : '') + l
    if (nPorts === undefined) {
      dataLines.push(current)
      current = ''
    } else {
      const expected = 1 + nPorts * nPorts * 2
      const nums = current.split(/\s+/).filter(x => x.match(/[-+]?\d/))
      if (nums.length >= expected) {
        dataLines.push(current)
        current = ''
      }
    }
  }
  if (current) dataLines.push(current)
  return dataLines
}

function guessNPorts(allNums: number[]): number {
  for (let n = 1; n <= 10; ++n) {
    const sampleLen = 1 + n * n * 2
    if (allNums.length % sampleLen === 0) {
      return n
    }
  }
  throw new Error('ポート数の自動推定に失敗しました')
}

function buildSParams(nPorts: number): string[] {
  const sParams: string[] = []
  for (let i = 1; i <= nPorts; ++i) {
    for (let j = 1; j <= nPorts; ++j) {
      sParams.push(`S${i}${j}`)
    }
  }
  return sParams
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
  const { freqUnit, format, z0 } = parseHeader(lines)
  let nPorts: number | undefined = undefined
  if (filename) {
    const m = filename.match(/\.s(\d+)p$/i)
    if (m) nPorts = parseInt(m[1], 10)
  }
  const dataLines = extractDataLines(lines, nPorts)
  const allNums = dataLines.join(' ').split(/\s+/).map(Number).filter(x => !isNaN(x))
  if (nPorts === undefined) nPorts = guessNPorts(allNums)
  const sampleLen = 1 + nPorts * nPorts * 2
  const nSamples = Math.floor(allNums.length / sampleLen)
  const sParams = buildSParams(nPorts)
  const chartData: ChartRow[] = []
  for (let s = 0; s < nSamples; ++s) {
    const base = s * sampleLen
    const freq =
      freqUnit === 'GHZ' ? allNums[base] * 1e9 :
      freqUnit === 'MHZ' ? allNums[base] * 1e6 :
      freqUnit === 'KHZ' ? allNums[base] * 1e3 :
      allNums[base]
    const row: ChartRow = { freq }
    for (let i = 1; i <= nPorts; ++i) {
      for (let j = 1; j <= nPorts; ++j) {
        const idx = base + 1 + ((i - 1) * nPorts + (j - 1)) * 2
        let mag = allNums[idx]
        const phase = allNums[idx + 1]
        if (format === 'DB') {
          mag = Math.pow(10, mag / 20)
        } else if (format === 'RI') {
          mag = Math.sqrt(mag * mag + phase * phase)
        }
        row[`S${i}${j}`] = mag
      }
    }
    chartData.push(row)
  }
  return { chartData, sParams, nPorts, freqUnit, format, z0 }
}
