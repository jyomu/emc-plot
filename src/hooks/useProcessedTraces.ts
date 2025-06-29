import { useMemo } from 'react'
import { useTraces } from './useTraces'
import { useSelectedSParams } from './useSelectedSParams'
import { dftAbs, idftReal, ma, logTransform } from '../utils/pipeline'
import { usePreProcessControls } from './useProcessControls'
import type { PartialPlotData } from '../types/plot'

export type ProcessedTracesMode = 'raw' | 'dft' | 'idft'

export function useProcessedTraces(mode: ProcessedTracesMode = 'raw'): PartialPlotData[] {
  const { allTraces } = useTraces()
  const { selectedSParams } = useSelectedSParams()
  
  // 処理タイプに応じた前処理状態を取得
  const { state: dftPreProcessState } = usePreProcessControls('dft')
  const { state: idftPreProcessState } = usePreProcessControls('idft')
  
  return useMemo(() => {
    // 選択されたSパラメータのトレースのみをフィルタ
    const traces = allTraces.filter(t => 
      typeof t.name === 'string' && selectedSParams.includes(t.name)
    )
    
    if (traces.length === 0) return []
    
    let processedTraces: PartialPlotData[]
    
    switch (mode) {
      case 'dft':
        processedTraces = traces.map(t => {
          try {
            // DFT用の前処理パイプライン
            const pipeline = [
              ma(dftPreProcessState.maEnabled, dftPreProcessState.maWindow),
              logTransform(dftPreProcessState.logType),
              dftAbs
            ]
            const y = pipeline.reduce((acc, fn) => fn(acc), t.y)
            return {
              ...t,
              y,
              name: t.name + ' (DFT)'
            }
          } catch (error) {
            console.warn(`DFT processing failed for ${t.name}:`, error)
            return { ...t, name: t.name + ' (DFT - Error)' }
          }
        })
        
        // DFT前半のみ表示の処理
        if (dftPreProcessState.showHalf) {
          processedTraces = processedTraces.map(t => ({
            ...t,
            y: t.y.slice(0, Math.floor(t.y.length / 2)),
            x: t.x ? (Array.isArray(t.x) ? t.x.slice(0, Math.floor(t.x.length / 2)) : t.x) : t.x
          }))
        }
        break
        
      case 'idft':
        processedTraces = traces.map(t => {
          try {
            // IDFT用の前処理パイプライン
            const pipeline = [
              ma(idftPreProcessState.maEnabled, idftPreProcessState.maWindow),
              logTransform(idftPreProcessState.logType),
              idftReal
            ]
            const y = pipeline.reduce((acc, fn) => fn(acc), t.y)
            return {
              ...t,
              y,
              name: t.name + ' (IDFT)'
            }
          } catch (error) {
            console.warn(`IDFT processing failed for ${t.name}:`, error)
            return { ...t, name: t.name + ' (IDFT - Error)' }
          }
        })
        
        // IDFT前半のみ表示の処理
        if (idftPreProcessState.showHalf) {
          processedTraces = processedTraces.map(t => ({
            ...t,
            y: t.y.slice(0, Math.floor(t.y.length / 2)),
            x: t.x ? (Array.isArray(t.x) ? t.x.slice(0, Math.floor(t.x.length / 2)) : t.x) : t.x
          }))
        }
        break
        
      default:
        processedTraces = traces
    }
    
    return processedTraces
  }, [allTraces, selectedSParams, mode, dftPreProcessState, idftPreProcessState])
}
