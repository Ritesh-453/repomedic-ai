export default function ConfidenceMeter({ confidence }) {
  const color = confidence >= 80 ? 'var(--accent)' : confidence >= 60 ? 'var(--yellow)' : 'var(--red)'
  return (
    <div style={{ textAlign: 'center', minWidth: 80 }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', position: 'relative',
        background: `conic-gradient(${color} ${confidence * 3.6}deg, var(--bg3) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          width: 54, height: 54, borderRadius: '50%', background: 'var(--bg2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <span style={{ color, fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{confidence}</span>
          <span style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 9 }}>%</span>
        </div>
      </div>
      <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</div>
    </div>
  )
}
