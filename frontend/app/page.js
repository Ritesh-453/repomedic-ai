'use client'
import { Poppins } from 'next/font/google'
const poppins = Poppins({ subsets: ['latin'], weight: ['800'] })
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import HeroGrid from '../components/HeroGrid'

export default function Home() {
  const router = useRouter()
  const [repoUrl, setRepoUrl] = useState('')
  const [bugDescription, setBugDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!repoUrl.trim() || !bugDescription.trim()) {
      setError('Please fill in both fields')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, bugDescription })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      localStorage.setItem('repomedic_analysis', JSON.stringify({ ...data, repoUrl, bugDescription }))
      router.push('/analyze')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <HeroGrid />
      <Navbar />

      {/* Hero Section */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '120px 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Badge */}
        <div className="fade-up" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <span style={{
            background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)',
            padding: '6px 16px', borderRadius: 999, fontSize: 12, fontFamily: 'var(--font-mono)',
            letterSpacing: '0.1em', textTransform: 'uppercase'
          }}>
            ⚡ Powered by IBM BOB + Groq AI
          </span>
        </div>

        {/* Title */}
        <h1 className={`${poppins.className} fade-up-1`}  style={{
          fontSize: 'clamp(40px, 7vw, 80px)',
          fontWeight: 800, textAlign: 'center', lineHeight: 1.05, marginBottom: 24
        }}>
          Your AI{' '}
          <span style={{
            color: 'var(--accent)',
            textShadow: '0 0 40px rgba(0,255,136,0.4)'
          }}>Debugging</span>
          <br />Teammate
        </h1>

        <p className="fade-up-2" style={{
          textAlign: 'center', color: 'var(--text2)', fontSize: 18,
          maxWidth: 560, margin: '0 auto 56px', lineHeight: 1.7, fontFamily: 'var(--font-mono)', fontWeight: 300
        }}>
          Paste any GitHub repository. Ask about any bug.<br />
          Get root cause, affected files, and a fix — instantly.
        </p>

        {/* Form */}
        <form onSubmit={handleAnalyze} className="fade-up-3" style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 16
        }}>
          {/* Repo URL */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
              GitHub Repository URL
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 14
              }}>$</span>
              <input
                type="text"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repository"
                style={{
                  width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '14px 14px 14px 30px', color: 'var(--text)',
                  fontFamily: 'var(--font-mono)', fontSize: 14, outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Bug Description */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
              Describe the Bug
            </label>
            <textarea
              value={bugDescription}
              onChange={e => setBugDescription(e.target.value)}
              placeholder="Why does the login fail after signup? Why does the API return 500?"
              rows={3}
              style={{
                width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px', color: 'var(--text)',
                fontFamily: 'var(--font-mono)', fontSize: 14, outline: 'none', resize: 'vertical',
                transition: 'border-color 0.2s', lineHeight: 1.6
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)',
              borderRadius: 8, padding: '10px 14px', color: 'var(--red)',
              fontFamily: 'var(--font-mono)', fontSize: 13
            }}>⚠ {error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'var(--bg3)' : 'var(--accent)',
              color: loading ? 'var(--text2)' : '#000',
              border: 'none', borderRadius: 10, padding: '16px 32px',
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-sans)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10,
              boxShadow: loading ? 'none' : '0 0 30px var(--accent-glow)'
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid var(--text3)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Analyzing Repository...
              </>
            ) : (
              <>⚡ Diagnose Bug</>
            )}
          </button>
        </form>

        {/* Stats */}
        <div className="fade-up-4" style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 48 }}>
          {[['Root Cause', 'Identified'], ['Affected Files', 'Pinpointed'], ['Fix + Code', 'Generated']].map(([label, sub]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{label}</div>
              <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
