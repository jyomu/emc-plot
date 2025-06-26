import React from 'react'
import { GitHubLink } from './GitHubLink'

export const Header: React.FC = () => (
  <header style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* 左詰め要素をここに追加可能 */}
    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <GitHubLink />
      {/* 右詰め要素をここに追加可能 */}
    </div>
  </header>
)
