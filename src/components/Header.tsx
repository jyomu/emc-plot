import React from 'react'
import { GitHubLink } from './GitHubLink'

export const Header: React.FC = () => (
  <header style={{
    position: 'fixed',
    top: 16,
    right: 16,
    zIndex: 1000,
    background: 'none',
    border: 'none',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  }}>
    <GitHubLink />
    {/* 他にヘッダーに追加したい要素があればここに */}
  </header>
)
