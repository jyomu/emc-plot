import { useTraces } from './useTraces'
import { useSelectedTraces } from './useSelectedTraces'
import { useSelectedTracesData } from './useSelectedTracesData'

export function useRawTraces() {
  const { allTraces } = useTraces()
  const { selected } = useSelectedTraces()
  return useSelectedTracesData(allTraces, selected)
}
