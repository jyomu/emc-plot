// SParamChart: アプリ全体の状態管理（ファイルロード・トレース選択）と各空間プロットの組み立てのみ担当
// 各空間のロジック・状態・UIはSpacePlotに委譲
// Sパラメータ空間のデータ生成のみローカルで担当
// 依存スコープを最小化し、親子の結合を極力減らす

import { SParamSelector } from '../components/app/SParamSelector'
import { FileLoader } from '../components/app/FileLoader'
import { PlotSection } from '../components/plot/PlotSection'

export function SParamChart() {
  return (
    <div className="w-full mx-auto px-4 text-center">
      <h1>Touchstone Sパラメータプロッタ (nポート対応)</h1>
      <FileLoader />
      <div>
        <SParamSelector />
        <div className="flex flex-col gap-8 my-6">
          <PlotSection
            mode="raw"
            title="Sパラメータ"
            space="frequency"
          />
          {(['dft', 'idft'] as const).map(processType => (
            <PlotSection
              key={processType}
              mode="processed"
              processType={processType}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
