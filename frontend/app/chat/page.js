'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'

// Simple markdown renderer — no extra library needed
const renderMarkdown = (text) => {
  const lines = text.split('\n')
  const elements = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={key++} style={{ height: 8 }} />)
      continue
    }

    // Bullet points: * or -
    if (line.match(/^[\*\-] /)) {
      const content = line.replace(/^[\*\-] /, '')
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0 }}>▸</span>
          <span>{formatInline(content)}</span>
        </div>
      )
      continue
    }

    // Numbered list: 1. 2. 3.
    if (line.match(/^\d+\. /)) {
      const num = line.match(/^(\d+)\. /)[1]
      const content = line.replace(/^\d+\. /, '')
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0, minWidth: 16 }}>{num}.</span>
          <span>{formatInline(content)}</span>
        </div>
      )
      continue
    }

    // Regular line
    elements.push(
      <div key={key++} style={{ marginBottom: 2 }}>
        {formatInline(line)}
      </div>
    )
  }

  return elements
}

// Handle **bold** and `code` inline
const formatInline = (text) => {
  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    // Inline code `text`
    const codeMatch = remaining.match(/`(.+?)`/)

    const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity
    const codeIdx = codeMatch ? remaining.indexOf(codeMatch[0]) : Infinity

    if (boldIdx === Infinity && codeIdx === Infinity) {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }

    if (boldIdx < codeIdx) {
      if (boldIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, boldIdx)}</span>)
      parts.push(<strong key={key++} style={{ color: 'var(--text)', fontWeight: 700 }}>{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldIdx + boldMatch[0].length)
    } else {
      if (codeIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, codeIdx)}</span>)
      parts.push(
        <code key={key++} style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 4, padding: '1px 6px', fontSize: 12,
          color: 'var(--accent)', fontFamily: 'var(--font-mono)'
        }}>{codeMatch[1]}</code>
      )
      remaining = remaining.slice(codeIdx + codeMatch[0].length)
    }
  }

  return parts
}

export default function ChatPage() {
  const router = useRouter()
  const [repoUrl, setRepoUrl] = useState('')
  const [repoSet, setRepoSet] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('repomedic_analysis')
    if (stored) {
      const data = JSON.parse(stored)
      if (data.repoUrl) { setRepoUrl(data.repoUrl); setRepoSet(true) }
    }
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSetRepo = (e) => {
    e.preventDefault()
    if (repoUrl.trim()) setRepoSet(true)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, question: input, conversationHistory: history })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const aiMsg = { role: 'assistant', content: data.answer }
      setMessages(prev => [...prev, aiMsg])
      setHistory(data.conversationHistory)
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = ['Explain the authentication flow', 'Where is error handling done?', 'What are the main API routes?', 'Explain the database schema']

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: 800, width: '100%', margin: '0 auto', padding: '80px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        <h1 className="fade-up" style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
          Chat with Repository
        </h1>
        <p className="fade-up-1" style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 24 }}>
          Ask anything about the codebase — architecture, bugs, flows, anything.
        </p>

        {!repoSet && (
          <form onSubmit={handleSetRepo} className="fade-up-2" style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 24
          }}>
            <label style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
              Enter Repository URL First
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none' }} />
              <button type="submit" style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Set Repo</button>
            </div>
          </form>
        )}

        {repoSet && (
          <>
            <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 8, padding: '8px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>📦 {repoUrl.replace('https://github.com/', '')}</span>
              <button onClick={() => setRepoSet(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11 }}>change</button>
            </div>

            <div style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, minHeight: 360, maxHeight: 460, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
              {messages.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
                  <p style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>Try asking:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {suggestions.map(s => (
                      <button key={s} onClick={() => setInput(s)} style={{
                        background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                        padding: '8px 14px', color: 'var(--text2)', fontFamily: 'var(--font-mono)',
                        fontSize: 12, cursor: 'pointer'
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg3)',
                    color: msg.role === 'user' ? '#000' : 'var(--text)',
                    fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.7,
                    border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none'
                  }}>
                    {msg.role === 'assistant' && (
                      <div style={{ fontSize: 10, color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        BOB + Groq AI
                      </div>
                    )}
                    {/* ─── Rendered Markdown for AI, plain text for user ─── */}
                    {msg.role === 'assistant'
                      ? <div>{renderMarkdown(msg.content)}</div>
                      : msg.content
                    }
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: 6, padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px 12px 12px 4px', width: 'fit-content' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: `blink 1s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder="Ask about the codebase..."
                disabled={loading}
                style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <button type="submit" disabled={loading || !input.trim()} style={{
                background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 10,
                padding: '14px 20px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14,
                opacity: loading || !input.trim() ? 0.5 : 1
              }}>Send</button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}