import { getFreqMultiplier } from './freqUnit'

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

function resolveNPorts(filename: string, allNums: number[]): number {
  // ファイル名からnPortsを取得（例: .s2p → 2ポート）
  const m = filename.match(/\.s(\d+)p$/i)
  if (m) return parseInt(m[1], 10)
  // データ長からnPortsを推定
  // Touchstoneの1サンプルは「freq + nPorts^2 * 2」個の数値
  // 1 <= nPorts <= 10 の範囲で、データ長が割り切れるnPortsを探す
  for (let n = 1; n <= 10; ++n) {
    const sampleLen = 1 + n * n * 2
    if (allNums.length % sampleLen === 0) {
      return n
    }
  }
  throw new Error('ポート数の決定に失敗しました')
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
  // ファイル読み込み
  const text: string = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
  const filename = file.name
  const lines = text.split(/\r?\n/)

  // ヘッダ解析
  const { freqUnit, format, z0 } = parseHeader(lines)

  // データ部抽出・数値配列化
  const dataLines = extractDataLines(lines, undefined)
  const allNums = dataLines.join(' ').split(/\s+/).map(Number).filter(x => !isNaN(x))

  // ポート数決定
  const nPorts = resolveNPorts(filename, allNums)
  const sampleLen = 1 + nPorts * nPorts * 2
  const nSamples = Math.floor(allNums.length / sampleLen)

  // Sパラ名リスト生成
  const sParams = buildSParams(nPorts)

  // チャートデータ生成
  const chartData: ChartRow[] = Array.from({ length: nSamples }, (_, s) => {
    const base = s * sampleLen
    const freq = getFreqMultiplier(freqUnit) * allNums[base]
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
    return row
  })

  return { chartData, sParams, nPorts, freqUnit, format, z0 }
}
