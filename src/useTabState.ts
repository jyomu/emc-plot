import { useState } from 'react'

export type TabKey = 'raw' | 'fft' | 'cep'
export interface TabDef { key: TabKey; label: string }

const TAB_LIST: TabDef[] = [
  { key: 'raw', label: 'Sパラメータ' },
  { key: 'fft', label: 'スペクトラム' },
  { key: 'cep', label: 'ケプストラム' },
]

export function useTabState(initial: TabKey = 'raw') {
  const [activeTab, setActiveTab] = useState<TabKey>(initial)
  return { activeTab, setActiveTab, tabList: TAB_LIST }
}
