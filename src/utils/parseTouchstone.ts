import type { PartialPlotData } from '../types/plot'

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
    for (let rowPort = 1; rowPort <= nPorts; ++rowPort) {
      for (let colPort = 1; colPort <= nPorts; ++colPort) {
        sParams.push(`S${rowPort}${colPort}`)
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
    const filename = file.name;
    const doc = new TouchstoneDocument(filename, text);
    return doc.getPartialPlotData();
  }
}

class TouchstoneDataArray {
  allNums: number[];
  nPorts: number;
  sampleLen: number;
  constructor(allNums: number[], nPorts: number) {
    this.allNums = allNums;
    this.nPorts = nPorts;
    this.sampleLen = 1 + nPorts * nPorts * 2;
  }
  getFreq(sampleIdx: number): number {
    return this.allNums[sampleIdx * this.sampleLen];
  }
  getMagPhase(sampleIdx: number, rowPort: number, colPort: number): { mag: number, phase: number } {
    const idx = sampleIdx * this.sampleLen + 1 + ((rowPort - 1) * this.nPorts + (colPort - 1)) * 2;
    const mag = this.allNums[idx];
    const phase = this.allNums[idx + 1];
    return { mag, phase };
  }
  getMagPhaseByKey(sampleIdx: number, sParamKey: string): { mag: number, phase: number } {
    const rowPort = Number(sParamKey[1]);
    const colPort = Number(sParamKey[2]);
    return this.getMagPhase(sampleIdx, rowPort, colPort);
  }
}

class TouchstoneDocument {
  filename: string;
  text: string;
  header: { freqUnit: string, format: string, z0: number };
  nPorts: number;
  sParams: string[];
  dataArray: TouchstoneDataArray;

  constructor(filename: string, text: string) {
    this.filename = filename;
    this.text = text;
    const lines = text.split(/\r?\n/);
    this.header = TouchstoneParser.parseHeader(lines);
    const dataLines = TouchstoneParser.extractDataLines(lines);
    const allNums = dataLines.join(' ').split(/\s+/).map(Number).filter(x => !isNaN(x));
    this.nPorts = TouchstoneParser.resolveNPorts(filename, allNums);
    this.sParams = TouchstoneParser.buildSParams(this.nPorts);
    this.dataArray = new TouchstoneDataArray(allNums, this.nPorts);
  }

  getPartialPlotData(): PartialPlotData[] {
    const { freqUnit, format, z0 } = this.header;
    const nSamples = Math.floor(this.dataArray.allNums.length / (1 + this.nPorts * this.nPorts * 2));
    return this.sParams.map((sParamKey) => {
      const x = Array.from({ length: nSamples }, (_, sampleIdx) =>
        TouchstoneParser.getFreqMultiplier(freqUnit) * this.dataArray.getFreq(sampleIdx)
      );
      const y = Array.from({ length: nSamples }, (_, sampleIdx) => {
        const { mag, phase } = this.dataArray.getMagPhaseByKey(sampleIdx, sParamKey);
        let value = mag;
        if (format === 'MA') {
          // MA: mag=振幅, phase=位相（度）
        } else if (format === 'RI') {
          value = Math.sqrt(mag * mag + phase * phase);
        }
        return value;
      });
      return {
        x,
        y,
        type: 'scatter',
        mode: 'lines',
        name: sParamKey,
        meta: { space: 'frequency', format, freqUnit, nPorts: this.nPorts, sParams: this.sParams, z0 },
      };
    });
  }
}

export const parseTouchstone = TouchstoneParser.parseTouchstone;
