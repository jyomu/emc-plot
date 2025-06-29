import { useState } from 'react'
import type { ProcessParams, LogType } from '../types/plot'

const getInitialProcessParams = (type: 'dft' | 'idft'): ProcessParams =>
  type === 'dft'
    ? { key: 'dft', label: 'DFT', maEnabled: false, maWindow: 50, logType: 'none' }
    : { key: 'idft', label: 'IDFT', maEnabled: false, maWindow: 50, logType: 'none' }

export function usePlotProcess(type: 'dft' | 'idft') {
  const [process, setProcess] = useState<ProcessParams>(getInitialProcessParams(type))
  const [showHalf, setShowHalf] = useState(true)

  const setMaEnabled = (v: boolean) => setProcess(s => ({ ...s, maEnabled: v }))
  const setMaWindow = (v: number) => setProcess(s => ({ ...s, maWindow: v }))
  const setLogType = (v: LogType) => setProcess(s => ({ ...s, logType: v }))

  return {
    process,
    setMaEnabled,
    setMaWindow,
    setLogType,
    showHalf,
    setShowHalf,
  }
}
