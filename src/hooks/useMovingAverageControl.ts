import { useState } from 'react'

export function useMovingAverageControl(initialShowMA = false, initialWindow = 50) {
  const [showMA, setShowMA] = useState(initialShowMA)
  const [maWindow, setMaWindow] = useState(initialWindow)
  return { showMA, setShowMA, maWindow, setMaWindow }
}
