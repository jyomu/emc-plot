import type { PlotData } from 'plotly.js'

export type PartialPlotData = Omit<Partial<PlotData>, 'y'> & {
  y: number[]
}

export type LogType = 'log'|'log10'|'log2'|'none';

// 処理パラメータ型定義（前処理パラメータのみを持つ）
export interface DftProcess {
  key: 'dft';
  label: string;
  maEnabled: boolean;
  maWindow: number;
  logType: LogType;
}
export interface IdftProcess {
  key: 'idft';
  label: string;
  maEnabled: boolean;
  maWindow: number;
  logType: LogType;
}
export type ProcessParams = DftProcess | IdftProcess;
