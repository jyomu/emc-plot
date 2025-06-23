import { TouchstoneChart } from './TouchstoneChart'
import type { PartialPlotData } from '../types/plot'

export interface SParamChartProps {
  traces: PartialPlotData[]
}

export function SParamChart({ traces }: SParamChartProps) {
  return <TouchstoneChart traces={traces} />
}
