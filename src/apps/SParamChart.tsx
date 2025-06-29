// SParamChart: Touchstoneファイルのロード・選択・グラフ表示をまとめる最上位UI
import { FileLoader } from '../components/app/FileLoader'
import { SParamSelector } from '../components/app/SParamSelector'
import { SParamPlot } from '../components/plot/SParamPlot'

export function SParamChart() {
  return (
    <main className="w-full mx-auto px-4 text-center">
      <h1>Touchstone Sパラメータプロッタ (nポート対応)</h1>
      <FileLoader />
      <SParamSelector />
      <section className="flex flex-col gap-8 my-6">
        <SParamPlot type="raw" title="Sパラメータ" space="frequency" />
        <SParamPlot type="dft" />
        <SParamPlot type="idft" />
      </section>
    </main>
  )
}
