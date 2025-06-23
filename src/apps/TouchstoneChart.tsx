import { useState, useMemo } from 'react'
import type { PlotData } from 'plotly.js'
import { SParamSelector } from '../components/SParamSelector'
import { TabContent } from '../components/TabContent'

type TouchstoneChartProps = {
  traces: Partial<PlotData>[]
  format: 'DB' | 'MA' | 'RI'
}

export function TouchstoneChart({ traces }: TouchstoneChartProps) {
  const sParams = traces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean)
  const [selected, setSelected] = useState<string[]>(sParams.slice(0, 1))

  // 選択された全Sパラメータの信号系列を配列で渡す
  const signals = useMemo(() => {
    return traces
      .filter(t => typeof t.name === 'string' && selected.includes(t.name))
      .map(t => Array.isArray(t?.y) ? t.y.filter((v): v is number => typeof v === 'number') : [])
      .filter(arr => arr.length > 0)
  }, [traces, selected])

  return (
    <>
      <SParamSelector traces={traces} selected={selected} onChange={(s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
      <TabContent
        signal={signals}
      />
    </>
  )
}
