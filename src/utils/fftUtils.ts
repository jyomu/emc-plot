import type { PartialPlotData } from '../types/plot'

// DFT: 離散フーリエ変換（O(N^2)）
// 実数配列inputを複素スペクトル（re, im）に変換
export function dft(input: number[]): { re: number[]; im: number[] } {
  const N = input.length
  if (N < 1) return { re: [], im: [] }
  const re = new Array(N).fill(0)
  const im = new Array(N).fill(0)
  for (let k = 0; k < N; k++) {
    for (let n = 0; n < N; n++) {
      const angle = (-2 * Math.PI * k * n) / N
      re[k] += input[n] * Math.cos(angle)
      im[k] += input[n] * Math.sin(angle)
    }
  }
  return { re, im }
}

// IDFT: 離散逆フーリエ変換（O(N^2)）
// 複素スペクトル（re, im）から時系列信号（実数配列）を復元
export function idft(re: number[], im: number[]): number[] {
  const N = re.length
  if (N < 1) return []
  const out = new Array(N).fill(0)
  for (let n = 0; n < N; n++) {
    for (let k = 0; k < N; k++) {
      const angle = (2 * Math.PI * k * n) / N
      out[n] += re[k] * Math.cos(angle) - im[k] * Math.sin(angle)
    }
    out[n] /= N
  }
  return out
}

// IFFT（スペクトラム→時系列）を計算し、PartialPlotDataとして返す
// input.y: 振幅スペクトル（実数配列）→ 虚部0としてIDFT
export function calcIFFTTrace(input: PartialPlotData): PartialPlotData {
  const N = input.y.length
  const re = input.y.slice()
  const im = new Array(N).fill(0)
  const y = idft(re, im)
  return {
    x: Array.from({ length: N }, (_, i) => i),
    y,
    name: (input.name ?? '') + ' (IFFT)',
    meta: { ...(input.meta ?? {}), space: 'time' },
    type: 'scatter',
    mode: 'lines',
  }
}

// logType: 'log'|'log10'|'log2'|'none' で切り替え
export function calcCepstrumFromSpectrumTrace(spectrum: PartialPlotData, logType: 'log'|'log10'|'log2'|'none' = 'log'): PartialPlotData {
  let logSpec: number[]
  if (logType === 'log10') {
    logSpec = spectrum.y.map((v: number) => Math.log10(Math.abs(v) + 1e-12))
  } else if (logType === 'log2') {
    logSpec = spectrum.y.map((v: number) => Math.log2(Math.abs(v) + 1e-12))
  } else if (logType === 'none') {
    logSpec = spectrum.y.map((v: number) => Math.abs(v))
  } else {
    logSpec = spectrum.y.map((v: number) => Math.log(Math.abs(v) + 1e-12))
  }
  const { re: cre, im: cim } = dft(logSpec)
  const cepstrum = idft(cre, cim)
  return {
    x: Array.from({ length: cepstrum.length }, (_, i) => i),
    y: cepstrum,
    name: spectrum.name ? spectrum.name + ' Cepstrum' : 'Cepstrum',
    meta: { ...spectrum.meta, space: 'cepstrum' },
    type: 'scatter',
    mode: 'lines',
  }
}
