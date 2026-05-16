'use client'
import { useState } from 'react'
import Navbar from '../../components/Navbar'

export default function SummaryPage() {
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  const handleSummary = async (e) => {
    e.preventDefault()
    if (!repoUrl.trim()) return
    setLoading(true); setError(''); setSummary(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repo-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSummary(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '90px 24px 60px' }}>
        <h1 className="fade-up" style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Repository Summary</h1>
        <p className="fade-up-1" style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 32 }}>
          IBM BOB analyzes your repository and generates a full architecture overview.
        </p>

        <form onSubmit={handleSummary} className="fade-up-2" style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repository"
              style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 14, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <button type="submit" disabled={loading} style={{
              background: loading ? 'var(--bg3)' : 'var(--accent)', color: loading ? 'var(--text2)' : '#000',
              border: 'none', borderRadius: 8, padding: '12px 24px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap'
            }}>
              {loading ? 'Analyzing...' : '🤖 Summarize'}
            </button>
          </div>
          {error && <p style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 10 }}>⚠ {error}</p>}
        </form>

        {summary && (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', flex: 1, textAlign: 'center' }}>
                <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700 }}>{summary.totalFiles}</div>
                <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Files</div>
              </div>
              <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 10, padding: '16px 20px', flex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🤖</span>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>IBM BOB Analysis</div>
                  <div style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Repository context generated successfully</div>
                </div>
              </div>
            </div>

            {/* ─── Plain English Explanation ─── */}
            {summary.plainSummary && (
              <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⚡ What This Repo Does
                </div>
                <p style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.9, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {summary.plainSummary}
                </p>
              </div>
            )}

            {/* BOB Technical Overview */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                🤖 BOB Technical Analysis
              </div>
              <pre style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {summary.summary}
              </pre>
            </div>

            {/* File Structure */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>File Structure</div>
              <pre style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
                {summary.structure}
              </pre>
            </div>

          </div>
        )}
      </div>
    </main>
  )
}