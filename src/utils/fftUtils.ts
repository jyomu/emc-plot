import FFT from 'fft.js'
import type { PartialPlotData } from '../types/plot'

function nextPow2(n: number): number {
  return 2 ** Math.ceil(Math.log2(n))
}

function fftMagnitude(input: number[]): number[] {
  const N = nextPow2(input.length)
  const fft = new FFT(N)
  const out = fft.createComplexArray()
  const data = fft.createComplexArray()
  for (let i = 0; i < N; i++) {
    data[2 * i] = i < input.length ? input[i] : 0
    data[2 * i + 1] = 0
  }
  fft.transform(out, data)
  const spectrum = []
  for (let i = 0; i < N / 2; i++) {
    const re = out[2 * i]
    const im = out[2 * i + 1]
    spectrum.push(Math.sqrt(re * re + im * im))
  }
  return spectrum
}

// 振幅スペクトル
export function calcAmplitudeSpectrumTrace(input: PartialPlotData): PartialPlotData {
  const spectrum = fftMagnitude(input.y)
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
  const spectrum = fftMagnitude(input.y)
  const logSpec = spectrum.map(mag => Math.log(mag + 1e-12))
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
  const y = logSpec.y
  const N = y.length
  const fft = new FFT(N)
  const out = fft.createComplexArray()
  const data = fft.createComplexArray()
  for (let i = 0; i < N; i++) {
    data[2 * i] = y[i]
    data[2 * i + 1] = 0
  }
  fft.inverseTransform(out, data)
  const cepstrum = Array.from({ length: N }, (_, i) => out[2 * i])
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
  const N = input.y.length * 2
  // FFT.jsの仕様: Nは2以上かつ2のべき乗
  if (N < 2 || (N & (N - 1)) !== 0) {
    return {
      x: [],
      y: [],
      name: (input.name ?? '') + ' (IFFT)',
      meta: { ...input.meta, space: 'time' },
      type: 'scatter',
      mode: 'lines',
    }
  }
  const fft = new FFT(N)
  const out = fft.createComplexArray()
  const data = fft.createComplexArray()
  for (let i = 0; i < input.y.length; i++) {
    data[2 * i] = input.y[i]
    data[2 * i + 1] = 0
  }
  for (let i = input.y.length; i < N; i++) {
    data[2 * i] = 0
    data[2 * i + 1] = 0
  }
  fft.inverseTransform(out, data)
  const time = Array.from({ length: N }, (_, i) => i)
  const y = Array.from({ length: N }, (_, i) => out[2 * i])
  return {
    x: time,
    y,
    name: (input.name ?? '') + ' (IFFT)',
    meta: { ...input.meta, space: 'time' },
    type: 'scatter',
    mode: 'lines',
  }
}
