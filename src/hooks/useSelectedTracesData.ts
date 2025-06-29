import type { PartialPlotData } from '../types/plot'

export function useSelectedTracesData(traces: PartialPlotData[], selected: string[]) {
  return traces.filter(t => typeof t.name === 'string' && selected.includes(t.name))
    .map(t => ({
      ...t,
      name: t.name + ' (Sパラメータ)'
    }))
}
