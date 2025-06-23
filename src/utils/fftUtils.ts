import type { PartialPlotData } from '../types/plot'

// DFT
function dft(input: number[]): { re: number[]; im: number[] } {
  const N = input.length
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

// IDFT
function idft(re: number[], im: number[]): number[] {
  const N = re.length
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

// 振幅スペクトル
export function calcAmplitudeSpectrumTrace(input: PartialPlotData): PartialPlotData {
  const { re, im } = dft(input.y)
  const spectrum = re.map((r, i) => Math.sqrt(r * r + im[i] * im[i]))
  const x = Array.from({ length: spectrum.length }, (_, i) => i)
  return {
    x,
    y: spectrum,
    name: input.name ?? 'Amplitude Spectrum',
    meta: { space: 'frequency' },
    type: 'scatter',
    mode: 'lines',
  }
}

// 対数スペクトル
export function calcLogSpectrumTrace(input: PartialPlotData): PartialPlotData {
  const { re, im } = dft(input.y)
  const logSpec = re.map((r, i) => Math.log(Math.sqrt(r * r + im[i] * im[i]) + 1e-12))
  const x = Array.from({ length: logSpec.length }, (_, i) => i)
  return {
    x,
    y: logSpec,
    name: input.name ?? 'Log Spectrum',
    meta: { space: 'frequency' },
    type: 'scatter',
    mode: 'lines',
  }
}

// ケプストラム
export function calcCepstrumTrace(input: PartialPlotData): PartialPlotData {
  const logSpec = calcLogSpectrumTrace(input)
  const { re, im } = dft(logSpec.y)
  const N = re.length
  // IDFTで実部のみ
  const cepstrum = idft(re, im)
  return {
    x: Array.from({ length: N }, (_, i) => i),
    y: cepstrum,
    name: input.name ?? 'Cepstrum',
    meta: { space: 'cepstrum' },
    type: 'scatter',
    mode: 'lines',
  }
}

// IFFT（スペクトラム→時系列）
export function calcIFFTTrace(input: PartialPlotData): PartialPlotData {
  // input.y: 振幅スペクトル（実数配列）→虚部0としてIDFT
  const N = input.y.length
  if (N < 1) {
    return {
      x: [],
      y: [],
      name: (input.name ?? '') + ' (IFFT)',
      meta: { ...input.meta, space: 'time' },
      type: 'scatter',
      mode: 'lines',
    }
  }
  const re = input.y.slice()
  const im = new Array(N).fill(0)
  const y = idft(re, im)
  return {
    x: Array.from({ length: N }, (_, i) => i),
    y,
    name: (input.name ?? '') + ' (IFFT)',
    meta: { ...input.meta, space: 'time' },
    type: 'scatter',
    mode: 'lines',
  }
}
