import { useTraces } from './useTraces'
import { useSelectedSParams } from './useSelectedSParams'
import { dftAbs, idftReal } from '../utils/pipeline'

export type ProcessedTracesMode = 'raw' | 'dft' | 'idft'

export function useProcessedTraces(mode: ProcessedTracesMode = 'raw') {
  const { allTraces } = useTraces()
  const { selectedSParams } = useSelectedSParams()
  const traces = allTraces.filter(t => typeof t.name === 'string' && selectedSParams.includes(t.name))
  switch (mode) {
    case 'dft':
      return traces.map(t => ({
        ...t,
        y: dftAbs(t.y),
        name: t.name + ' (DFT)'
      }))
    case 'idft':
      return traces.map(t => ({
        ...t,
        y: idftReal(t.y),
        name: t.name + ' (IDFT)'
      }))
    default:
      return traces
  }
}
