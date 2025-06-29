import { useTraces } from './useTraces'
import { useSelectedTraces } from './useSelectedTraces'
import { useSelectedTracesData } from './useSelectedTracesData'
import { idftReal } from '../utils/pipeline'

export function useIDFTTraces() {
  const { allTraces } = useTraces()
  const { selected } = useSelectedTraces()
  const traces = useSelectedTracesData(allTraces, selected)
  return traces.map(t => ({
    ...t,
    y: idftReal(t.y),
    name: t.name + ' (IDFT)'
  }))
}
