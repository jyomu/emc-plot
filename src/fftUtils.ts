import FFT from 'fft.js'

function nextPow2(n: number): number {
  return 2 ** Math.ceil(Math.log2(n))
}

// FFT: 実数配列→複素スペクトル（配列: [re, im, re, im, ...]）
export function calcFFTComplex(input: number[]): Float64Array {
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
export function calcAmplitudeSpectrum(fftComplex: Float64Array): number[] {
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
export function processSpectrum(
  spectrum: number[],
  preProcess: (mag: number) => number = (mag) => Math.log(mag + 1e-12)
): number[] {
  return spectrum.map(preProcess)
}

// IFFT: 複素配列→実数系列
export function calcIFFTReal(input: number[]): number[] {
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

// ケプストラム変換の全段階を返す
export function calcCepstrumStages(
  input: number[],
  preProcess: (mag: number) => number = (mag) => Math.log(mag + 1e-12)
): {
  fftComplex: Float64Array,
  amplitude: number[],
  preProcessed: number[],
  cepstrum: number[]
} {
  const fftComplex = calcFFTComplex(input)
  const amplitude = calcAmplitudeSpectrum(fftComplex)
  const preProcessed = processSpectrum(amplitude, preProcess)
  const cepstrum = calcIFFTReal(preProcessed)
  return { fftComplex, amplitude, preProcessed, cepstrum }
}
