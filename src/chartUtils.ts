// 移動平均ユーティリティ
export function movingAverage(arr: number[], windowSize: number): number[] {
  const result: number[] = []
  let windowSum = 0
  for (let i = 0; i < arr.length; i++) {
    windowSum += arr[i]
    if (i >= windowSize) {
      windowSum -= arr[i - windowSize]
    }
    result.push(windowSum / Math.min(windowSize, i + 1))
  }
  return result
}

// Plotlyデータ配列から最大ウィンドウサイズを取得
import type { PlotData } from 'plotly.js'
export function getMaxMAWindow(plotData: Partial<PlotData>[]): number {
  const first = plotData[0]
  if (
    first &&
    Array.isArray(first.x) &&
    first.x.every(v => typeof v === 'number')
  ) {
    return first.x.length
  }
  return 1
}

// 数値配列抽出
export function getNumberArray(arr: unknown): number[] {
  return Array.isArray(arr) ? arr.filter((v): v is number => typeof v === 'number') : []
}
