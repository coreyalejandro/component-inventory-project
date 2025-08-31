
'use client'
import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader2, Play, Github } from 'lucide-react'

export function ScanForm() {
  const [owner, setOwner] = useState('octocat')
  const [repo, setRepo] = useState('Hello-World')
  const [gitRef, setGitRef] = useState('main')
  const [jwt, setJwt] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function enqueue() {
    setLoading(true); setMessage(null)
    try {
      const res = await fetch('/api/scan', { method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({ owner, repo, gitRef, jwt }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMessage(`Scan enqueued. ID: ${data.scanId}`)
    } catch (e:any) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input placeholder="owner" value={owner} onChange={e=>setOwner(e.target.value)} />
        <Input placeholder="repo" value={repo} onChange={e=>setRepo(e.target.value)} />
        <Input placeholder="gitRef (e.g., main)" value={gitRef} onChange={e=>setGitRef(e.target.value)} />
        <Button onClick={enqueue} disabled={loading || !jwt}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          Scan now
        </Button>
      </div>
      <div className="mt-3">
        <label className="block text-sm font-medium mb-1">Paste JWT from GitHub login</label>
        <Input placeholder="JWT from backend /oauth/github/login" value={jwt} onChange={e=>setJwt(e.target.value)} />
        <div className="text-xs text-neutral-600 mt-2 flex items-center gap-2">
          <Github className="h-4 w-4" />
          <span>Step: Open your backend at <code>http://localhost:3000/oauth/github/login</code>, complete login, copy the JWT shown, and paste it above.</span>
        </div>
      </div>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  )
}
