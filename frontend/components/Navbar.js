'use client'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(8,11,15,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', padding: '0 24px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 28, height: 28, background: 'var(--accent)', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: '#000', fontWeight: 800
        }}>R</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
          RepoMedic<span style={{ color: 'var(--accent)' }}>.ai</span>
        </span>
      </Link>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['/', 'Analyze'], ['/summary', 'Summary'], ['/chat', 'Chat']].map(([href, label]) => (
          <Link key={href} href={href} style={{
            color: 'var(--text2)', textDecoration: 'none', fontFamily: 'var(--font-mono)',
            fontSize: 13, padding: '6px 14px', borderRadius: 6, border: '1px solid transparent',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.target.style.color = 'var(--accent)'; e.target.style.borderColor = 'var(--accent)' }}
          onMouseLeave={e => { e.target.style.color = 'var(--text2)'; e.target.style.borderColor = 'transparent' }}
          >{label}</Link>
        ))}
      </div>
    </nav>
  )
}
