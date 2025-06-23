import FFT from 'fft.js'
import type { PartialPlotData } from '../types/plot'

function nextPow2(n: number): number {
  return 2 ** Math.ceil(Math.log2(n))
}

// FFT: 実数配列→複素スペクトル
export function calcFFTTrace(input: number[]): PartialPlotData {
  const N = nextPow2(input.length)
  const fft = new FFT(N)
  const out = fft.createComplexArray()
  const data = fft.createComplexArray()
  for (let i = 0; i < N; i++) {
    data[2 * i] = i < input.length ? input[i] : 0
    data[2 * i + 1] = 0
  }
  fft.transform(out, data)
  const x = Array.from({ length: N }, (_, i) => i)
  const y = Array.from({ length: N }, (_, i) => out[2 * i])
  return {
    x, y, name: 'FFT (Re)', meta: { space: 'frequency' }, type: 'scatter', mode: 'lines'
  }
}

// 振幅スペクトル
export function calcAmplitudeSpectrumTrace(input: number[]): PartialPlotData {
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
  const x = Array.from({ length: N / 2 }, (_, i) => i)
  return {
    x, y: spectrum, name: 'Amplitude Spectrum', meta: { space: 'frequency' }, type: 'scatter', mode: 'lines'
  }
}

// 対数スペクトル
export function calcLogSpectrumTrace(input: number[]): PartialPlotData {
  const amp = calcAmplitudeSpectrumTrace(input)
  return {
    ...amp,
    y: Array.isArray(amp.y) ? amp.y.map(mag => typeof mag === 'number' ? Math.log(mag + 1e-12) : null) : amp.y,
    name: 'Log Spectrum',
    meta: { space: 'frequency' },
  }
}

// ケプストラム
export function calcCepstrumTrace(input: number[]): PartialPlotData {
  const logSpec = calcLogSpectrumTrace(input)
  const N = Array.isArray(logSpec.y) ? logSpec.y.length : 0
  const fft = new FFT(N)
  const out = fft.createComplexArray()
  const data = fft.createComplexArray()
  for (let i = 0; i < N; i++) {
    data[2 * i] = Array.isArray(logSpec.y) ? logSpec.y[i] : 0
    data[2 * i + 1] = 0
  }
  fft.inverseTransform(out, data)
  const cepstrum = Array.from({ length: N }, (_, i) => out[2 * i])
  return {
    x: Array.from({ length: N }, (_, i) => i),
    y: cepstrum,
    name: 'Cepstrum',
    meta: { space: 'cepstrum' },
    type: 'scatter',
    mode: 'lines',
  }
}
