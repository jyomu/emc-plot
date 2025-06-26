// SParamChart: アプリ全体の状態管理（ファイルロード・トレース選択）と各空間プロットの組み立てのみ担当
// 各空間のロジック・状態・UIはSpacePlotに委譲
// Sパラメータ空間のデータ生成のみローカルで担当
// 依存スコープを最小化し、親子の結合を極力減らす

import { useState } from 'react'
import type { PartialPlotData } from '../types/plot'
import { SParamSelector } from '../components/SParamSelector'
import { FileLoader } from '../components/FileLoader'
import { PlotSection } from '../components/PlotSection'

function getSelectedSParamTraces(traces: PartialPlotData[], selected: string[]): PartialPlotData[] {
  return traces.filter(t => typeof t.name === 'string' && selected.includes(t.name))
    .map(t => ({
      ...t,
      name: t.name + ' (Sパラメータ)'
    }))
}

export function SParamChart() {
  const [traces, setTraces] = useState<PartialPlotData[] | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  return (
    <div className="w-full mx-auto px-4 text-center">
      <h1>Touchstone Sパラメータプロッタ (nポート対応)</h1>
      <FileLoader
        onLoad={(traces, selectedNames) => {
          setTraces(traces)
          setSelected(selectedNames)
        }}
      />
      {traces && (
        <div>
          <SParamSelector traces={traces} selected={selected} onChange={(s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
          <div className="flex flex-col gap-8 my-6">
            <PlotSection
              mode="raw"
              title="Sパラメータ"
              data={getSelectedSParamTraces(traces, selected)}
              space="frequency"
            />
            {(['dft', 'idft'] as const).map(processType => (
              <PlotSection
                key={processType}
                mode="processed"
                processType={processType}
                traces={traces}
                selected={selected}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
