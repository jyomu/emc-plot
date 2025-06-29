import { useTraces } from './useTraces'
import { useSelectedTraces } from './useSelectedTraces'
import { useSelectedTracesData } from './useSelectedTracesData'
import { dftAbs } from '../utils/pipeline'

export function useDFTTraces() {
  const { allTraces } = useTraces()
  const { selected } = useSelectedTraces()
  const traces = useSelectedTracesData(allTraces, selected)
  return traces.map(t => ({
    ...t,
    y: dftAbs(t.y),
    name: t.name + ' (DFT)'
  }))
}
