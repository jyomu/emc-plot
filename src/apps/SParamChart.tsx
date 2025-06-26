import { useState } from 'react'
import type { PartialPlotData } from '../types/plot'
import { SParamSelector } from '../components/SParamSelector'
import { PlotArea } from '../components/PlotArea'
import { parseTouchstone } from '../utils/parseTouchstone'
import { dft, idft } from '../utils/fftUtils'
import { movingAverage } from '../utils/chartUtils'

// 前処理関数
function applyPreprocess(y: number[], opts: { logType?: 'log'|'log10'|'log2'|'none', maEnabled?: boolean, maWindow?: number }) {
  let out = y.slice()
  if (opts.maEnabled && opts.maWindow && opts.maWindow > 1) {
    out = movingAverage(out, opts.maWindow)
  }
  if (opts.logType && opts.logType !== 'none') {
    switch (opts.logType) {
      case 'log10': out = out.map(v => Math.log10(Math.abs(v) + 1e-12)); break
      case 'log2': out = out.map(v => Math.log2(Math.abs(v) + 1e-12)); break
      default: out = out.map(v => Math.log(Math.abs(v) + 1e-12))
    }
  }
  return out
}

export function SParamChart() {
  const [traces, setTraces] = useState<PartialPlotData[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  // DFT前処理
  const [dftLogType, setDftLogType] = useState<'log'|'log10'|'log2'|'none'>('none')
  const [dftMaEnabled, setDftMaEnabled] = useState(false)
  const [dftMaWindow, setDftMaWindow] = useState(50)
  // IDFT前処理
  const [idftMaEnabled, setIdftMaEnabled] = useState(false)
  const [idftMaWindow, setIdftMaWindow] = useState(50)

  // 選択されたtrace（周波数領域データ）
  const spectrumTracesRaw = traces?.filter(t => typeof t.name === 'string' && selected.includes(t.name)) ?? []

  // Sパラメータ（生データ）
  const sparamTraces = spectrumTracesRaw.map(t => ({
    ...t,
    meta: { ...(t.meta ?? {}), space: 'frequency' },
    name: t.name + ' (Sパラメータ)'
  }))

  // DFT
  const dftTraces = spectrumTracesRaw.map(t => {
    const yPre = applyPreprocess(t.y, { logType: dftLogType, maEnabled: dftMaEnabled, maWindow: dftMaWindow })
    const { re, im } = dft(yPre)
    // 複素スペクトルの絶対値を表示
    const yAbs = re.map((r, i) => Math.sqrt(r*r + im[i]*im[i]))
    return {
      ...t,
      y: yAbs,
      meta: { ...(t.meta ?? {}), space: 'dft' },
      name: t.name + ' (DFT)'
    }
  })

  // IDFT
  const idftTraces = spectrumTracesRaw.map(t => {
    const yPre = applyPreprocess(t.y, { maEnabled: idftMaEnabled, maWindow: idftMaWindow })
    const re = yPre.slice()
    const im = new Array(yPre.length).fill(0)
    const yTime = idft(re, im)
    return {
      ...t,
      y: yTime,
      meta: { ...(t.meta ?? {}), space: 'idft' },
      name: t.name + ' (IDFT)'
    }
  })

  return (
    <div className="w-full mx-auto px-4 text-center">
      <h1>Touchstone Sパラメータプロッタ (nポート対応)</h1>
      <input type="file" accept=".snp,.s2p,.s3p,.s4p" onChange={async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
          const traces = await parseTouchstone(file)
          setTraces(traces)
          setSelected(traces.map(t => typeof t.name === 'string' && t.name ? t.name : '').filter(Boolean).slice(0, 1))
          setError(null)
        } catch (err) {
          setError('パースエラー: ' + (err instanceof Error ? err.message : String(err)))
        }
      }} className="mb-2" />
      <div className="mb-2">
        <button onClick={async () => {
          try {
            const res = await fetch('/SMA(NARROW11(CP-max).s3p')
            if (!res.ok) throw new Error('サンプルファイルの取得に失敗しました')
            const blob = await res.blob()
            const file = new File([blob], 'SMA(NARROW11(CP-max).s3p')
            const traces = await parseTouchstone(file)
            setTraces(traces)
            setSelected(traces.map(t => typeof t.name === 'string' && t.name ? t.name : '').filter(Boolean).slice(0, 1))
            setError(null)
          } catch (err) {
            setError('サンプル読込エラー: ' + (err instanceof Error ? err.message : String(err)))
          }
        }}>サンプル（SMA(NARROW11(CP-max).s3p）を読み込む</button>
      </div>
      {traces && (
        <>
          <SParamSelector traces={traces} selected={selected} onChange={(s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
          <div className="flex flex-col gap-8 my-6">
            {/* Sパラメータ空間 */}
            <div>
              <div className="font-bold mb-1 flex items-center gap-2">Sパラメータ</div>
              <PlotArea space="frequency" data={sparamTraces} />
            </div>
            {/* DFT空間 */}
            <div>
              <div className="font-bold mb-1 flex items-center gap-2">
                DFT
                <label className="ml-4">
                  <input type="checkbox" checked={dftMaEnabled} onChange={e => setDftMaEnabled(e.target.checked)} /> 移動平均
                </label>
                {dftMaEnabled && (
                  <input type="number" min={2} max={100} value={dftMaWindow} onChange={e => setDftMaWindow(Number(e.target.value))} className="w-16 ml-2" />
                )}
                <label className="ml-4">
                  log関数:
                  <select value={dftLogType} onChange={e => {
                    const v = e.target.value
                    if (v === 'log' || v === 'log10' || v === 'log2' || v === 'none') setDftLogType(v)
                  }} className="ml-1">
                    <option value="log">log</option>
                    <option value="log10">log10</option>
                    <option value="log2">log2</option>
                    <option value="none">なし</option>
                  </select>
                </label>
              </div>
              <PlotArea space="none" data={dftTraces} />
            </div>
            {/* IDFT空間 */}
            <div>
              <div className="font-bold mb-1 flex items-center gap-2">
                IDFT
                <label className="ml-4">
                  <input type="checkbox" checked={idftMaEnabled} onChange={e => setIdftMaEnabled(e.target.checked)} /> 移動平均
                </label>
                {idftMaEnabled && (
                  <input type="number" min={2} max={100} value={idftMaWindow} onChange={e => setIdftMaWindow(Number(e.target.value))} className="w-16 ml-2" />
                )}
              </div>
              <PlotArea space="none" data={idftTraces} />
            </div>
          </div>
        </>
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  )
}
