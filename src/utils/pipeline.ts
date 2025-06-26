import { dft, idft } from './fftUtils'
import { movingAverage } from './chartUtils'

export const ma = (enabled: boolean, window: number) => (y: number[]) =>
  enabled && window > 1 ? movingAverage(y, window) : y

export const logTransform = (type: 'log'|'log10'|'log2'|'none') => (y: number[]) => {
  if (type === 'none') return y
  if (type === 'log10') return y.map(v => Math.log10(Math.abs(v) + 1e-12))
  if (type === 'log2') return y.map(v => Math.log2(Math.abs(v) + 1e-12))
  return y.map(v => Math.log(Math.abs(v) + 1e-12))
}

export const dftAbs = (y: number[]) => {
  const { re, im } = dft(y)
  return re.map((r, i) => Math.sqrt(r*r + im[i]*im[i]))
}

export const idftReal = (y: number[]) => {
  const re = y.slice()
  const im = new Array(y.length).fill(0)
  return idft(re, im)
}
