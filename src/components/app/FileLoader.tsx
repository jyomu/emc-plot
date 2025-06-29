import React from 'react'
import { parseTouchstone } from '../../utils/parseTouchstone'
import type { PartialPlotData } from '../../types/plot'

interface FileLoaderProps {
  onLoad: (traces: PartialPlotData[]) => void
}

export const FileLoader: React.FC<FileLoaderProps> = ({ onLoad }) => {
  const handleFile = async (file: File) => {
    try {
      const traces = await parseTouchstone(file)
      onLoad(traces)
    } catch (error) {
      console.error('Error parsing Touchstone file:', error)
      alert('Failed to parse the file. Please check the file format and try again.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleSample = async () => {
    const res = await fetch('/SMA(NARROW11(CP-max).s3p')
    if (!res.ok) throw new Error('サンプルファイルの取得に失敗しました')
    const blob = await res.blob()
    const file = new File([blob], 'SMA(NARROW11(CP-max).s3p')
    await handleFile(file)
  }

  return (
    <div className="mb-2 w-full flex flex-col items-center">
      <input
        type="file"
        accept=".snp,.s2p,.s3p,.s4p"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button onClick={handleSample}>
        サンプル（SMA(NARROW11(CP-max).s3p）を読み込む
      </button>
    </div>
  )
}
