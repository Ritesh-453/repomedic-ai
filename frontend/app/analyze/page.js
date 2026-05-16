'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import CodeBlock from '../../components/CodeBlock'
import ConfidenceMeter from '../../components/ConfidenceMeter'

export default function AnalyzePage() {
  const router = useRouter()
  const [data, setData] = useState(null)

  // Fix feature states
  const [fixing, setFixing] = useState(false)
  const [fixResult, setFixResult] = useState(null)
  const [fixError, setFixError] = useState('')

  // PR states
  const [creatingPR, setCreatingPR] = useState(false)
  const [prResult, setPrResult] = useState(null)
  const [prError, setPrError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('repomedic_analysis')
    if (!stored) { router.push('/'); return }
    setData(JSON.parse(stored))
  }, [])

  const handleFix = async () => {
    setFixing(true)
    setFixError('')
    setFixResult(null)
    setPrResult(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bugfix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent: data.improvedCode || data.reasoning || '',
          bugDescription: data.bugDescription || '',
          language: 'javascript'
        })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Fix failed')
      setFixResult(result)
    } catch (err) {
      setFixError(err.message)
    } finally {
      setFixing(false)
    }
  }

  const handleCreatePR = async () => {
    setCreatingPR(true)
    setPrError('')
    setPrResult(null)
    try {
      const filePath = (data.affectedFiles || [])[0] || 'index.js'
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: data.repoUrl,
          filePath,
          fixedCode: fixResult.fixedCode,
          bugDescription: data.bugDescription || ''
        })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'PR creation failed')
      setPrResult(result)
    } catch (err) {
      setPrError(err.message)
    } finally {
      setCreatingPR(false)
    }
  }

  if (!data) return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '90px 24px 60px' }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <button onClick={() => router.push('/')} style={{
            background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 16, padding: 0,
            display: 'flex', alignItems: 'center', gap: 6
          }}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
                Bug Analysis Report
              </h1>
              <p style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                {data.repoUrl?.replace('https://github.com/', '')}
              </p>
            </div>
            <ConfidenceMeter confidence={data.confidence || 0} />
          </div>
        </div>

        {/* Summary Banner */}
        <div className="fade-up-1" style={{
          background: 'var(--accent-dim)', border: '1px solid var(--accent)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 12
        }}>
          <span style={{ color: 'var(--accent)', fontSize: 18, marginTop: 1 }}>⚡</span>
          <div>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Summary</div>
            <p style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 14, lineHeight: 1.6 }}>{data.summary}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Root Cause */}
          <div className="fade-up-2" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--red)' }}>●</span> Root Cause
            </div>
            <p style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.7 }}>{data.rootCause}</p>
          </div>

          {/* Affected Files */}
          <div className="fade-up-2" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--yellow)' }}>●</span> Affected Files
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(data.affectedFiles || []).length === 0
                ? <span style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>No specific files identified</span>
                : (data.affectedFiles || []).map((f, i) => (
                  <div key={i} style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '6px 10px', fontFamily: 'var(--font-mono)',
                    fontSize: 12, color: 'var(--yellow)'
                  }}>📄 {f}</div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div className="fade-up-3" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--blue)' }}>●</span> AI Reasoning
          </div>
          <p style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8 }}>{data.reasoning}</p>
        </div>

        {/* How to Fix */}
        <div className="fade-up-3" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--accent)' }}>●</span> How to Fix
          </div>
          <p style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8 }}>{data.fix}</p>
        </div>

        {/* Improved Code */}
        {data.improvedCode && (
          <div className="fade-up-4">
            <CodeBlock code={data.improvedCode} title="Suggested Fix" />
          </div>
        )}

        {/* ─── FIX THIS BUG SECTION ─── */}
        <div className="fade-up-4" style={{
          marginTop: 32,
          background: 'var(--bg2)',
          border: '1px solid var(--accent)',
          borderRadius: 16,
          overflow: 'hidden'
        }}>
          {/* Section Header */}
          <div style={{
            background: 'var(--accent-dim)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                🔧 Auto-Fix
              </div>
              <p style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 12, margin: 0 }}>
                Let AI generate a step-by-step fix with corrected code — right here.
              </p>
            </div>
            {!fixResult && (
              <button
                onClick={handleFix}
                disabled={fixing}
                style={{
                  background: fixing ? 'var(--bg3)' : 'var(--accent)',
                  color: fixing ? 'var(--text2)' : '#000',
                  border: 'none', borderRadius: 10,
                  padding: '12px 24px', fontWeight: 700,
                  fontFamily: 'var(--font-sans)', cursor: fixing ? 'not-allowed' : 'pointer',
                  fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: fixing ? 'none' : '0 0 20px var(--accent-glow)',
                  transition: 'all 0.2s'
                }}
              >
                {fixing ? (
                  <>
                    <span style={{ width: 14, height: 14, border: '2px solid var(--text3)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Fixing...
                  </>
                ) : '🔧 Fix This Bug'}
              </button>
            )}
          </div>

          {/* Error */}
          {fixError && (
            <div style={{ padding: '16px 24px' }}>
              <div style={{
                background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)',
                borderRadius: 8, padding: '10px 14px', color: 'var(--red)',
                fontFamily: 'var(--font-mono)', fontSize: 13
              }}>⚠ {fixError}</div>
            </div>
          )}

          {/* Fix Result */}
          {fixResult && (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Steps */}
              {(fixResult.steps || []).map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    minWidth: 32, height: 32, borderRadius: '50%',
                    background: 'var(--accent)', color: '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, marginTop: 2
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{step.title}</div>
                    <p style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.7, margin: '0 0 10px' }}>{step.explanation}</p>
                    {step.code && <CodeBlock code={step.code} title={`Step ${i + 1} Code`} />}
                  </div>
                </div>
              ))}

              {/* Final Fixed Code */}
              {fixResult.fixedCode && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>✅ Final Fixed Code</div>
                  <CodeBlock code={fixResult.fixedCode} title="Complete Fix" />
                </div>
              )}

              {/* ─── CREATE PR SECTION ─── */}
              <div style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 20, marginTop: 8
              }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  🚀 Push Fix to GitHub
                </div>
                <p style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
                  Automatically create a Pull Request on <strong style={{ color: 'var(--text)' }}>{data.repoUrl?.replace('https://github.com/', '')}</strong> with this fix applied.
                </p>

                {/* PR Success */}
                {prResult ? (
                  <div style={{
                    background: 'rgba(0,255,136,0.08)', border: '1px solid var(--accent)',
                    borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
                  }}>
                    <div>
                      <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 4 }}>✅ Pull Request Created!</div>
                      <div style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>Branch: {prResult.branch}</div>
                    </div>
                    <a href={prResult.prUrl} target="_blank" rel="noreferrer" style={{
                      background: 'var(--accent)', color: '#000', borderRadius: 8,
                      padding: '10px 20px', fontWeight: 700, fontFamily: 'var(--font-sans)',
                      fontSize: 13, textDecoration: 'none', display: 'inline-block'
                    }}>View PR on GitHub →</a>
                  </div>
                ) : (
                  <>
                    {prError && (
                      <div style={{
                        background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)',
                        borderRadius: 8, padding: '10px 14px', color: 'var(--red)',
                        fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 12
                      }}>⚠ {prError}</div>
                    )}
                    <button
                      onClick={handleCreatePR}
                      disabled={creatingPR}
                      style={{
                        background: creatingPR ? 'var(--bg3)' : '#000',
                        color: creatingPR ? 'var(--text2)' : '#fff',
                        border: '1px solid var(--border)', borderRadius: 10,
                        padding: '12px 24px', fontWeight: 700,
                        fontFamily: 'var(--font-sans)', cursor: creatingPR ? 'not-allowed' : 'pointer',
                        fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'all 0.2s'
                      }}
                    >
                      {creatingPR ? (
                        <>
                          <span style={{ width: 14, height: 14, border: '2px solid var(--text3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                          Creating PR...
                        </>
                      ) : '🐙 Create Pull Request on GitHub'}
                    </button>
                  </>
                )}
              </div>

              {/* Re-fix button */}
              <button
                onClick={() => { setFixResult(null); setFixError(''); setPrResult(null); setPrError('') }}
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  color: 'var(--text3)', borderRadius: 8,
                  padding: '8px 16px', fontFamily: 'var(--font-mono)',
                  fontSize: 12, cursor: 'pointer', alignSelf: 'flex-start'
                }}
              >↺ Regenerate Fix</button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="fade-up-4" style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/')} style={{
            background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 10,
            padding: '12px 24px', fontWeight: 700, fontFamily: 'var(--font-sans)', cursor: 'pointer',
            fontSize: 14, boxShadow: '0 0 20px var(--accent-glow)'
          }}>⚡ Analyze Another Repo</button>
          <button onClick={() => router.push('/chat')} style={{
            background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '12px 24px', fontFamily: 'var(--font-sans)', cursor: 'pointer', fontSize: 14
          }}>💬 Chat with Repo</button>
        </div>
      </div>
    </main>
  )
}