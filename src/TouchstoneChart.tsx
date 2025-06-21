import { useState, useMemo, useCallback } from 'react'
import type { PlotData } from 'plotly.js'
import { calcFFT, calcCepstrum } from './fftUtils'
import { movingAverage, getNumberArray } from './chartUtils'
import { SParamSelector } from './SParamSelector'
import { TabContent } from './TabContent'
import { TabSwitcher } from './TabSwitcher'
import { useTabState } from './useTabState'
import type { TabKey } from './useTabState'

type TouchstoneChartProps = {
  traces: Partial<PlotData>[]
  format: 'DB' | 'MA' | 'RI'
}

type TabConfig = {
  plotData: Partial<PlotData>[];
  xLabel: string;
  yLabel: string;
};

type MakePlotTraces = ({
  traces,
  selected,
  yTransform,
  xTransform,
  nameSuffix,
  lineDash,
  hovertemplate,
}: {
  traces: Partial<PlotData>[];
  selected: string[];
  yTransform: (y: number[]) => number[];
  xTransform: (t: Partial<PlotData>, y: number[]) => number[];
  nameSuffix: string;
  lineDash: 'solid' | 'dash' | 'dot' | 'dashdot' | 'longdash';
  hovertemplate: string;
}) => Partial<PlotData>[];

function getTabConfig({
  tab,
  baseTraces,
  selected,
  format,
  showMA,
  maWindow,
  makePlotTraces,
}: {
  tab: TabKey;
  baseTraces: Partial<PlotData>[];
  selected: string[];
  format: 'DB' | 'MA' | 'RI';
  showMA: boolean;
  maWindow: number;
  makePlotTraces: MakePlotTraces;
}): TabConfig {
  let plotData: Partial<PlotData>[] = [];
  let xLabel = '';
  let yLabel = '';
  if (tab === 'raw') {
    xLabel = 'Frequency [Hz]';
    yLabel = format === 'DB' ? 'dB' : 'Magnitude';
    plotData = makePlotTraces({
      traces: baseTraces,
      selected,
      yTransform: (y: number[]) => y,
      xTransform: (t: Partial<PlotData>, _unused: number[]) => getNumberArray(t.x), // eslint-disable-line @typescript-eslint/no-unused-vars
      nameSuffix: '',
      lineDash: 'solid',
      hovertemplate: format === 'DB'
        ? `%{x:.2s}Hz<br>%{y:.3f} dB <extra></extra>`
        : `%{x:.2s}Hz<br>%{y:.3f} <extra></extra>`
    });
    if (showMA) {
      plotData = [
        ...plotData,
        ...makePlotTraces({
          traces: baseTraces,
          selected,
          yTransform: (y: number[]) => movingAverage(y, maWindow),
          xTransform: (t: Partial<PlotData>, _unused: number[]) => getNumberArray(t.x), // eslint-disable-line @typescript-eslint/no-unused-vars
          nameSuffix: ' (移動平均)',
          lineDash: 'dash',
          hovertemplate: format === 'DB'
            ? `%{x:.2s}Hz<br>%{y:.3f} dB <extra></extra>`
            : `%{x:.2s}Hz<br>%{y:.3f} <extra></extra>`
        })
      ];
    }
  } else if (tab === 'fft') {
    xLabel = 'Frequency [Hz]';
    yLabel = 'Amplitude';
    plotData = makePlotTraces({
      traces: baseTraces,
      selected,
      yTransform: (y: number[]) => calcFFT(y),
      xTransform: (t: Partial<PlotData>, y: number[]) => {
        const xArr = getNumberArray(t.x);
        if (xArr.length > 1) {
          const dt = xArr[1] - xArr[0];
          const Fs = 1 / dt;
          const N = y.length * 2;
          return Array.from({length: y.length}, (_, i) => i * Fs / N);
        }
        return Array.from({length: y.length}, (_, i) => i);
      },
      nameSuffix: ' (FFT of 元データ)',
      lineDash: 'dot',
      hovertemplate: `%{x:.2s}Hz<br>%{y:.3f} <extra></extra>`
    });
    if (showMA) {
      plotData = [
        ...plotData,
        ...makePlotTraces({
          traces: baseTraces,
          selected,
          yTransform: (y: number[]) => calcFFT(movingAverage(y, maWindow)),
          xTransform: (t: Partial<PlotData>, y: number[]) => {
            const xArr = getNumberArray(t.x);
            if (xArr.length > 1) {
              const dt = xArr[1] - xArr[0];
              const Fs = 1 / dt;
              const N = y.length * 2;
              return Array.from({length: y.length}, (_, i) => i * Fs / N);
            }
            return Array.from({length: y.length}, (_, i) => i);
          },
          nameSuffix: ' (FFT of 移動平均)',
          lineDash: 'dashdot',
          hovertemplate: `%{x:.2s}Hz<br>%{y:.3f} <extra></extra>`
        })
      ];
    }
  } else if (tab === 'cep') {
    xLabel = 'Quefrency [s]';
    yLabel = 'Cepstrum';
    plotData = makePlotTraces({
      traces: baseTraces,
      selected,
      yTransform: (y: number[]) => calcCepstrum(y),
      xTransform: (t: Partial<PlotData>, y: number[]) => {
        const xArr = getNumberArray(t.x);
        if (xArr.length > 1) {
          const dt = xArr[1] - xArr[0];
          return Array.from({length: y.length}, (_, i) => i * dt);
        }
        return Array.from({length: y.length}, (_, i) => i);
      },
      nameSuffix: ' (Cepstrum of 元データ)',
      lineDash: 'longdash',
      hovertemplate: `%{x}<br>%{y:.3f} <extra></extra>`
    });
    if (showMA) {
      plotData = [
        ...plotData,
        ...makePlotTraces({
          traces: baseTraces,
          selected,
          yTransform: (y: number[]) => calcCepstrum(movingAverage(y, maWindow)),
          xTransform: (t: Partial<PlotData>, y: number[]) => {
            const xArr = getNumberArray(t.x);
            if (xArr.length > 1) {
              const dt = xArr[1] - xArr[0];
              return Array.from({length: y.length}, (_, i) => i * dt);
            }
            return Array.from({length: y.length}, (_, i) => i);
          },
          nameSuffix: ' (Cepstrum of 移動平均)',
          lineDash: 'dashdot',
          hovertemplate: `%{x}<br>%{y:.3f} <extra></extra>`
        })
      ];
    }
  }
  return { plotData, xLabel, yLabel };
}

export function TouchstoneChart({ traces, format }: TouchstoneChartProps) {
  const sParams = traces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean)
  const [selected, setSelected] = useState<string[]>(sParams.slice(0, 1))
  const [showMA, setShowMA] = useState(false)
  const [maWindow, setMaWindow] = useState(50)
  const { activeTab, setActiveTab, tabList } = useTabState()
  const baseTraces = useMemo(() => traces.filter(t => typeof t.name === 'string' && selected.includes(t.name)).map(t => {
    if (Array.isArray(t.x)) {
      const hovertemplate = format === 'DB'
        ? `%{x:.2s}Hz<br>%{y:.3f} dB <extra></extra>`
        : `%{x:.2s}Hz<br>%{y:.3f} <extra></extra>`
      return {
        ...t,
        hovertemplate
      }
    }
    return t
  }), [traces, selected, format])

  const makePlotTraces: MakePlotTraces = useCallback(({
    traces,
    selected,
    yTransform,
    xTransform,
    nameSuffix,
    lineDash,
    hovertemplate,
  }) => {
    return traces
      .filter(t => typeof t.name === 'string' && selected.includes(t.name))
      .filter(t => Array.isArray(t.x) && t.x.every(v => typeof v === 'number'))
      .map(t => {
        const yArray = getNumberArray(t.y)
        const y = yTransform(yArray)
        const x = xTransform(t, y)
        return {
          x,
          y,
          type: 'scatter' as const,
          mode: 'lines' as const,
          name: `${t.name}${nameSuffix}`,
          line: { dash: lineDash },
          hovertemplate,
        }
      })
  }, [])

  const tabConfig = useMemo(() => getTabConfig({
    tab: activeTab,
    baseTraces,
    selected,
    format,
    showMA,
    maWindow,
    makePlotTraces,
  }), [activeTab, baseTraces, selected, format, showMA, maWindow, makePlotTraces])

  return (
    <>
      <SParamSelector traces={traces} selected={selected} onChange={(s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} tabList={tabList} />
      <TabContent
        plotData={tabConfig.plotData}
        xLabel={tabConfig.xLabel}
        yLabel={tabConfig.yLabel}
        activeTab={activeTab}
        showMA={showMA}
        setShowMA={setShowMA}
        maWindow={maWindow}
        setMaWindow={setMaWindow}
      />
    </>
  )
}
