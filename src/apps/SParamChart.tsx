// SParamChart: アプリ全体の状態管理（ファイルロード・トレース選択）と各空間プロットの組み立てのみ担当
// 各空間のロジック・状態・UIはSpacePlotに委譲
// Sパラメータ空間のデータ生成のみローカルで担当
// 依存スコープを最小化し、親子の結合を極力減らす

import { useMutation } from '@tanstack/react-query'
import type { PartialPlotData } from '../types/plot'
import { SParamSelector } from '../components/app/SParamSelector'
import { FileLoader } from '../components/app/FileLoader'
import { PlotSection } from '../components/plot/PlotSection'
import { parseTouchstone } from '../utils/parseTouchstone'
import { useSelectedTraces } from '../hooks/useSelectedTraces'

function getSelectedSParamTraces(traces: PartialPlotData[], selected: string[]): PartialPlotData[] {
  return traces.filter(t => typeof t.name === 'string' && selected.includes(t.name))
    .map(t => ({
      ...t,
      name: t.name + ' (Sパラメータ)'
    }))
}

export function SParamChart() {
  const { selected, toggleSelected } = useSelectedTraces()
  const mutation = useMutation({
    mutationFn: async (file: File) => {
      return await parseTouchstone(file)
    }
  })
  const traces = mutation.data || []
  const selectedTraces = getSelectedSParamTraces(traces, selected)

  return (
    <div className="w-full mx-auto px-4 text-center">
      <h1>Touchstone Sパラメータプロッタ (nポート対応)</h1>
      <FileLoader
        onFileLoad={file => mutation.mutate(file)}
      />
      <div>
        <SParamSelector traces={traces} selected={selected} onChange={toggleSelected} />
        <div className="flex flex-col gap-8 my-6">
          <PlotSection
            mode="raw"
            title="Sパラメータ"
            traces={selectedTraces}
            space="frequency"
          />
          {(['dft', 'idft'] as const).map(processType => (
            <PlotSection
              key={processType}
              mode="processed"
              processType={processType}
              traces={selectedTraces}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
