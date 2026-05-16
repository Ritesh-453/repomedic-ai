'use client'
export default function HeroGrid() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none'
    }}>
      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }} />
      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)',
        filter: 'blur(40px)'
      }} />
      {/* Corner accents */}
      <div style={{ position: 'absolute', top: 80, right: 80, width: 200, height: 200, border: '1px solid rgba(0,255,136,0.05)', borderRadius: 4, transform: 'rotate(15deg)' }} />
      <div style={{ position: 'absolute', bottom: 120, left: 80, width: 150, height: 150, border: '1px solid rgba(0,255,136,0.04)', borderRadius: 4, transform: 'rotate(-10deg)' }} />
    </div>
  )
}
