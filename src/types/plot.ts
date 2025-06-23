import type { PlotData } from 'plotly.js'

// yは必ずnumber[]型とする
export type PartialPlotData = Omit<Partial<PlotData>, 'y'> & {
  y: number[]
  meta?: { space: string }
}
