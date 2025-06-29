import type { PlotData } from 'plotly.js'

export type PartialPlotData = Omit<Partial<PlotData>, 'y'> & {
  y: number[]
}

export type LogType = 'log'|'log10'|'log2'|'none';
