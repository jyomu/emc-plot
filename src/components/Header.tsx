import React from 'react'
import { GitHubLink } from './GitHubLink'

export const Header: React.FC = () => (
  <header className="flex justify-between items-center">
    <div className="flex items-center">
      {/* 左詰め要素をここに追加可能 */}
    </div>
    <div className="flex items-center">
      <GitHubLink />
      {/* 右詰め要素をここに追加可能 */}
    </div>
  </header>
)
