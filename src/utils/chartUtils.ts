// 移動平均ユーティリティ（中心化移動平均、map版）
export function movingAverage(arr: number[], windowSize: number): number[] {
  const half = Math.floor(windowSize / 2)
  return arr.map((_, i) => {
    let start = Math.max(0, i - half)
    const end = Math.min(arr.length, i + half + (windowSize % 2 === 0 ? 0 : 1))
    // ウィンドウサイズが偶数の場合は前寄り
    if (windowSize % 2 === 0 && end - start < windowSize) {
      start = Math.max(0, end - windowSize)
    }
    const window = arr.slice(start, end)
    return window.reduce((sum, v) => sum + v, 0) / window.length
  })
}
