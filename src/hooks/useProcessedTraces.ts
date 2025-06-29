import { useTraces } from './useTraces'
import { useSelectedSParams } from './useSelectedSParams'
import { dftAbs, idftReal } from '../utils/pipeline'

export type ProcessedTracesMode = 'raw' | 'dft' | 'idft'

export function useProcessedTraces(mode: ProcessedTracesMode = 'raw', showHalf: boolean = false) {
  const { allTraces } = useTraces()
  const { selectedSParams } = useSelectedSParams()
  const traces = allTraces.filter(t => typeof t.name === 'string' && selectedSParams.includes(t.name))
  
  let processedTraces
  switch (mode) {
    case 'dft':
      processedTraces = traces.map(t => ({
        ...t,
        y: dftAbs(t.y),
        name: t.name + ' (DFT)'
      }))
      break
    case 'idft':
      processedTraces = traces.map(t => ({
        ...t,
        y: idftReal(t.y),
        name: t.name + ' (IDFT)'
      }))
      break
    default:
      processedTraces = traces
  }

  // DFT/IDFT前半のみ表示の処理
  if ((mode === 'dft' || mode === 'idft') && showHalf && processedTraces.length > 0) {
    processedTraces = processedTraces.map(t => ({
      ...t,
      y: t.y.slice(0, Math.floor(t.y.length / 2)),
      x: t.x ? (Array.isArray(t.x) ? t.x.slice(0, Math.floor(t.x.length / 2)) : t.x) : t.x
    }))
  }

  return processedTraces
}
