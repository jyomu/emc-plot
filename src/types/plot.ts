import type { PlotData } from 'plotly.js'

// Plotly.jsのPartial<PlotData>型を拡張し、metaプロパティを許可
export type PartialPlotData = Partial<PlotData> & {
  meta?: { space: string }
}
