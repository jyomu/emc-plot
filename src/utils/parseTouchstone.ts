import type { PartialPlotData } from '../types/plot'

export type ChartRow = { freq: number } & { [sParam: string]: number }

export class TouchstoneParser {
  static parseHeader(lines: string[]): { freqUnit: string, format: string, z0: number } {
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

  static extractDataLines(lines: string[]): string[] {
    const dataLines: string[] = []
    let current = ''
    for (const line of lines) {
      const l = line.trim()
      if (l === '' || l.startsWith('!') || l.startsWith('#')) continue
      current += (current ? ' ' : '') + l
      dataLines.push(current)
      current = ''
    }
    if (current) dataLines.push(current)
    return dataLines
  }

  static resolveNPorts(filename: string, allNums: number[]): number {
    const m = filename.match(/\.s(\d+)p$/i)
    if (m) return parseInt(m[1], 10)
    for (let n = 1; n <= 10; ++n) {
      const sampleLen = 1 + n * n * 2
      if (allNums.length % sampleLen === 0) {
        return n
      }
    }
    throw new Error('ポート数の決定に失敗しました')
  }

  static buildSParams(nPorts: number): string[] {
    const sParams: string[] = []
    for (let i = 1; i <= nPorts; ++i) {
      for (let j = 1; j <= nPorts; ++j) {
        sParams.push(`S${i}${j}`)
      }
    }
    return sParams
  }

  static getFreqMultiplier(freqUnit: string): number {
    switch (freqUnit.toLowerCase()) {
      case 'hz':
        return 1
      case 'khz':
        return 1e3
      case 'mhz':
        return 1e6
      case 'ghz':
        return 1e9
      default:
        throw new Error(`Unknown frequency unit: ${freqUnit}`)
    }
  }

  static async parseTouchstone(file: File): Promise<PartialPlotData[]> {
    const text: string = await file.text();
    const filename = file.name
    const lines = text.split(/\r?\n/)
    const { freqUnit, format: rawFormat, z0 } = TouchstoneParser.parseHeader(lines)
    if (rawFormat !== 'DB' && rawFormat !== 'MA' && rawFormat !== 'RI') {
      throw new Error(`Unexpected rawFormat value: ${rawFormat}. Expected 'DB', 'MA', or 'RI'.`)
    }
    const format = rawFormat
    const dataLines = TouchstoneParser.extractDataLines(lines)
    const allNums = dataLines.join(' ').split(/\s+/).map(Number).filter(x => !isNaN(x))
    const nPorts = TouchstoneParser.resolveNPorts(filename, allNums)
    const sampleLen = 1 + nPorts * nPorts * 2
    const nSamples = Math.floor(allNums.length / sampleLen)
    const sParams = TouchstoneParser.buildSParams(nPorts)
    const dataArr = new TouchstoneDataArray(allNums, nPorts, sampleLen, sParams)
    const chartData: ChartRow[] = Array.from({ length: nSamples }, (_, sampleIdx) => {
      const freq = TouchstoneParser.getFreqMultiplier(freqUnit) * dataArr.getFreq(sampleIdx)
      const row: ChartRow = { freq }
      for (let rowPort = 1; rowPort <= nPorts; ++rowPort) {
        for (let colPort = 1; colPort <= nPorts; ++colPort) {
          const { mag, phase } = dataArr.getMagPhase(sampleIdx, rowPort, colPort)
          let value = mag
          if (format === 'MA') {
            // MA: mag=振幅, phase=位相（度）
          } else if (format === 'RI') {
            value = Math.sqrt(mag * mag + phase * phase)
          }
          row[`S${rowPort}${colPort}`] = value
        }
      }
      return row
    })
    const baseMeta = { space: 'frequency', format, freqUnit, nPorts, sParams, z0 };
    const traces: PartialPlotData[] = sParams.map((s) => ({
      x: chartData.map(row => row.freq),
      y: chartData.map(row => row[s]),
      type: 'scatter',
      mode: 'lines',
      name: s,
      meta: { ...baseMeta },
    }))
    return traces
  }
}

class TouchstoneDataArray {
  allNums: number[];
  nPorts: number;
  sampleLen: number;
  sParams: string[];
  constructor(allNums: number[], nPorts: number, sampleLen: number, sParams: string[]) {
    this.allNums = allNums;
    this.nPorts = nPorts;
    this.sampleLen = sampleLen;
    this.sParams = sParams;
  }
  getFreq(sampleIdx: number): number {
    return this.allNums[sampleIdx * this.sampleLen]
  }
  getSParamIndex(sampleIdx: number, i: number, j: number): number {
    return sampleIdx * this.sampleLen + 1 + ((i - 1) * this.nPorts + (j - 1)) * 2
  }
  getMagPhase(sampleIdx: number, i: number, j: number): { mag: number, phase: number } {
    const idx = this.getSParamIndex(sampleIdx, i, j)
    return {
      mag: this.allNums[idx],
      phase: this.allNums[idx + 1],
    }
  }
}

// 既存の関数エクスポートも維持
export const parseTouchstone = TouchstoneParser.parseTouchstone;
