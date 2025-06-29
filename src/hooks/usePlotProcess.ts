// UI表示用のプロセス情報を提供するシンプルなhook
// 実際の制御はusePreProcessControlsで行う

export interface ProcessInfo {
  key: 'dft' | 'idft'
  label: string
}

const PROCESS_INFO: Record<'dft' | 'idft', ProcessInfo> = {
  dft: { key: 'dft', label: 'DFT' },
  idft: { key: 'idft', label: 'IDFT' }
} as const

export function usePlotProcess(type: 'dft' | 'idft'): ProcessInfo {
  return PROCESS_INFO[type]
}
