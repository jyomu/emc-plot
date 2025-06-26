import React from 'react'
import { GitHubLink } from './GitHubLink'

export const Header: React.FC = () => (
  <header style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 左右に要素を分ける
    padding: '16px',
    background: 'none',
    border: 'none',
    boxShadow: 'none',
    gap: 16
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {/* 左詰め要素をここに追加可能 */}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <GitHubLink />
      {/* 右詰め要素をここに追加可能 */}
    </div>
  </header>
)
