'use client'
import { useState } from 'react'

export default function CodeBlock({ code, title = 'Code' }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['var(--red)', 'var(--yellow)', 'var(--accent)'].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
            ))}
          </div>
          <span style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{title}</span>
        </div>
        <button onClick={copy} style={{
          background: copied ? 'var(--accent-dim)' : 'none', border: '1px solid var(--border)',
          borderRadius: 6, padding: '4px 10px', color: copied ? 'var(--accent)' : 'var(--text3)',
          fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', transition: 'all 0.2s'
        }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      {/* Code */}
      <pre style={{
        padding: 20, margin: 0, overflowX: 'auto', fontFamily: 'var(--font-mono)',
        fontSize: 13, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
      }}>{code}</pre>
    </div>
  )
}
