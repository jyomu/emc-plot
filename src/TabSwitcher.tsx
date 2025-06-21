import type { TabKey, TabDef } from './useTabState'

interface TabSwitcherProps {
  activeTab: TabKey
  onTabChange: (key: TabKey) => void
  tabList: TabDef[]
}

export function TabSwitcher({ activeTab, onTabChange, tabList }: TabSwitcherProps) {
  return (
    <div style={{ margin: '12px 0' }}>
      {tabList.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          style={{
            marginRight: 8,
            fontWeight: activeTab === tab.key ? 'bold' : 'normal',
            background: activeTab === tab.key ? '#e0e0e0' : undefined
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
