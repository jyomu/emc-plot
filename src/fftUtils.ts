import FFT from 'fft.js'

function nextPow2(n: number): number {
  return 2 ** Math.ceil(Math.log2(n))
}

// 実数配列のFFT（振幅スペクトル）を返す
export function calcFFT(input: number[]): number[] {
  const N = nextPow2(input.length)
  const fft = new FFT(N)
  const out = fft.createComplexArray()
  const data = fft.createComplexArray()
  for (let i = 0; i < N; i++) {
    data[2 * i] = i < input.length ? input[i] : 0
    data[2 * i + 1] = 0
  }
  fft.transform(out, data)
  // 振幅スペクトルを計算
  const spectrum = []
  for (let i = 0; i < N / 2; i++) {
    const re = out[2 * i]
    const im = out[2 * i + 1]
    spectrum.push(Math.sqrt(re * re + im * im))
  }
  return spectrum
}

// ケプストラム（対数スペクトルの逆FFTの実部）
export function calcCepstrum(input: number[]): number[] {
  const N = nextPow2(input.length)
  const fft = new FFT(N)
  const out = fft.createComplexArray()
  const data = fft.createComplexArray()
  for (let i = 0; i < N; i++) {
    data[2 * i] = i < input.length ? input[i] : 0
    data[2 * i + 1] = 0
  }
  fft.transform(out, data)
  // 振幅スペクトルの対数
  for (let i = 0; i < N; i++) {
    const re = out[2 * i]
    const im = out[2 * i + 1]
    const mag = Math.sqrt(re * re + im * im)
    data[2 * i] = Math.log(mag + 1e-12)
    data[2 * i + 1] = 0
  }
  // 逆FFT
  fft.inverseTransform(out, data)
  // 実部のみ返す
  const cepstrum = []
  for (let i = 0; i < N; i++) {
    cepstrum.push(out[2 * i])
  }
  return cepstrum
}
