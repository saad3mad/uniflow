"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import SectionHeader from '@/components/SectionHeader'
import Card from '@/components/Card'
import { ShieldCheck, RefreshCw, PlugZap } from 'lucide-react'

export default function MoodleSettingsPage() {
  const [baseUrl, setBaseUrl] = useState('')
  const [mode, setMode] = useState<'token' | 'credentials'>('credentials')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [privateToken, setPrivateToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function withAuthHeaders(): Promise<HeadersInit> {
    const { data } = await supabase.auth.getSession()
    const access = data.session?.access_token
    return access ? { Authorization: `Bearer ${access}` } : {}
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(await withAuthHeaders()),
      }
      const res = await fetch('/api/moodle/connect', {
        method: 'POST',
        headers,
        body: JSON.stringify({ baseUrl, username: mode === 'credentials' ? username : undefined, password: mode === 'credentials' ? password : undefined, token: mode === 'token' ? token : undefined, privateToken: privateToken || undefined }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to connect')

      // auto sync
      const syncRes = await fetch('/api/moodle/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({ baseUrl, verify: true }),
      })
      const syncJson = await syncRes.json()
      if (!syncRes.ok || !syncJson.ok) throw new Error(syncJson.error || 'Sync failed')

      setMessage(`Connected and synced: ${syncJson.counts.courses} courses, ${syncJson.counts.assignments} assignments`)
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReverify() {
    setLoading(true)
    setMessage(null)
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(await withAuthHeaders()),
      }
      const res = await fetch('/api/moodle/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ baseUrl }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Re-verify failed')
      setMessage(`Verified for user ${json.site?.username}`)
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <SectionHeader
        eyebrow={<span className="inline-flex items-center gap-2"><PlugZap className="w-4 h-4" /> Moodle Integration</span>}
        title="Connect your eClass account"
        subtitle="Securely connect your Moodle-based eClass to import courses, assignments, and materials."
      />

      <Card>
        <form onSubmit={handleConnect} className="space-y-6">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Moodle Base URL</label>
            <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} required placeholder="https://eclass.youruniversity.edu/" className="w-full px-3 py-2 rounded-lg bg-background-secondary border border-border focus-ring" />
          </div>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" checked={mode === 'credentials'} onChange={() => setMode('credentials')} /> Username & Password
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" checked={mode === 'token'} onChange={() => setMode('token')} /> Existing Token
            </label>
          </div>

          {mode === 'credentials' ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Moodle Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-3 py-2 rounded-lg bg-background-secondary border border-border focus-ring" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Moodle Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 rounded-lg bg-background-secondary border border-border focus-ring" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-text-secondary mb-1">Moodle Token</label>
              <input value={token} onChange={e => setToken(e.target.value)} required className="w-full px-3 py-2 rounded-lg bg-background-secondary border border-border focus-ring" />
            </div>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-1">Private Token (optional)</label>
            <input value={privateToken} onChange={e => setPrivateToken(e.target.value)} placeholder="Optional private token" className="w-full px-3 py-2 rounded-lg bg-background-secondary border border-border focus-ring" />
          </div>

          <div className="flex items-center gap-3">
            <button disabled={loading} className="btn-primary inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> {loading ? 'Connecting…' : 'Connect & Sync'}</button>
            <button type="button" disabled={loading} onClick={handleReverify} className="btn-secondary inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Re-verify</button>
          </div>

          {message && (
            <div className="text-sm text-text-secondary">{message}</div>
          )}
        </form>
      </Card>
    </div>
  )
}
