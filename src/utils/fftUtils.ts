import FFT from 'fft.js'
import type { PlotData } from 'plotly.js'

// Plotly.jsのPartial<PlotData>型をそのまま利用
export type PartialPlotData = Partial<PlotData>

function nextPow2(n: number): number {
  return 2 ** Math.ceil(Math.log2(n))
}

// FFT: 実数配列→複素スペクトル（配列: [re, im, re, im, ...]）
function calcFFTComplex(input: number[]): Float64Array {
  const N = nextPow2(input.length)
  const fft = new FFT(N)
  const out = fft.createComplexArray()
  const data = fft.createComplexArray()
  for (let i = 0; i < N; i++) {
    data[2 * i] = i < input.length ? input[i] : 0
    data[2 * i + 1] = 0
  }
  fft.transform(out, data)
  return Float64Array.from(out)
}

// 振幅スペクトル
function calcAmplitudeSpectrum(fftComplex: Float64Array): number[] {
  const N = fftComplex.length / 2
  const spectrum = []
  for (let i = 0; i < N / 2; i++) {
    const re = fftComplex[2 * i]
    const im = fftComplex[2 * i + 1]
    spectrum.push(Math.sqrt(re * re + im * im))
  }
  return spectrum
}

// 任意の前処理を適用したスペクトル
function processSpectrum(
  spectrum: number[],
  preProcess: (mag: number) => number = (mag) => Math.log(mag + 1e-12)
): number[] {
  return spectrum.map(preProcess)
}

// IFFT: 複素配列→実数系列
function calcIFFTReal(input: number[]): number[] {
  const N = nextPow2(input.length)
  const fft = new FFT(N)
  const out = fft.createComplexArray()
  const data = fft.createComplexArray()
  // 入力は実部のみ、虚部0
  for (let i = 0; i < N; i++) {
    data[2 * i] = i < input.length ? input[i] : 0
    data[2 * i + 1] = 0
  }
  fft.inverseTransform(out, data)
  const result = []
  for (let i = 0; i < N; i++) {
    result.push(out[2 * i])
  }
  return result
}

// --- Partial<PlotData> を返すAPI ---

// FFT複素スペクトル（実部/虚部）
export function calcFFTComplexTrace(input: number[]): PartialPlotData {
  const fft = calcFFTComplex(input)
  const N = fft.length / 2
  const x = Array.from({ length: N }, (_, i) => i)
  const yRe = Array.from({ length: N }, (_, i) => fft[2 * i])
  // 複素数の実部のみプロット（必要なら虚部も）
  return {
    x,
    y: yRe,
    name: 'FFT (Re)',
    type: 'scatter',
  }
}

// 振幅スペクトル
export function calcAmplitudeSpectrumTrace(input: number[], opts?: { fs?: number }): PartialPlotData {
  const fft = calcFFTComplex(input)
  const amp = calcAmplitudeSpectrum(fft)
  const N = amp.length
  const fs = opts?.fs ?? 1
  const x = Array.from({ length: N }, (_, i) => (fs * i) / N)
  return {
    x,
    y: amp,
    name: 'Amplitude Spectrum',
    type: 'scatter',
  }
}

// 任意の前処理を適用したスペクトル
export function processSpectrumTrace(
  input: number[],
  preProcess: (mag: number) => number = (mag) => Math.log(mag + 1e-12),
  opts?: { fs?: number }
): PartialPlotData {
  const fft = calcFFTComplex(input)
  const amp = calcAmplitudeSpectrum(fft)
  const processed = processSpectrum(amp, preProcess)
  const N = processed.length
  const fs = opts?.fs ?? 1
  const x = Array.from({ length: N }, (_, i) => (fs * i) / N)
  return {
    x,
    y: processed,
    name: 'Processed Spectrum',
    type: 'scatter',
  }
}

// ケプストラム変換の全段階をPartial<PlotData>で返す
export function calcCepstrumStagesTraces(
  input: number[],
  preProcess: (mag: number) => number = (mag) => Math.log(mag + 1e-12)
): {
  fft: PartialPlotData,
  amplitude: PartialPlotData,
  preProcessed: PartialPlotData,
  cepstrum: PartialPlotData
} {
  const fftComplex = calcFFTComplex(input)
  const amplitude = calcAmplitudeSpectrum(fftComplex)
  const preProcessed = processSpectrum(amplitude, preProcess)
  const cepstrum = calcIFFTReal(preProcessed)
  const N = amplitude.length
  return {
    fft: {
      x: Array.from({ length: N }, (_, i) => i),
      y: Array.from({ length: N }, (_, i) => fftComplex[2 * i]),
      name: 'FFT (Re)',
      type: 'scatter',
    },
    amplitude: {
      x: Array.from({ length: N }, (_, i) => i),
      y: amplitude,
      name: 'Amplitude Spectrum',
      type: 'scatter',
    },
    preProcessed: {
      x: Array.from({ length: N }, (_, i) => i),
      y: preProcessed,
      name: 'Processed Spectrum',
      type: 'scatter',
    },
    cepstrum: {
      x: Array.from({ length: N }, (_, i) => i),
      y: cepstrum,
      name: 'Cepstrum',
      type: 'scatter',
    },
  }
}
