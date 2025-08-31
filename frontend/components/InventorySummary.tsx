
'use client'
import { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'

type Props = { owner: string; repo: string }
export function InventorySummary({ owner, repo }: Props) {
  const [data, setData] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetch(`/api/inventory?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`)
      .then(r => r.json().then(j => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!mounted) return
        if (!ok) setError(j.error || 'Failed to load')
        else setData(j)
      })
      .catch(e => mounted && setError(String(e)))
    return () => { mounted = false }
  }, [owner, repo])

  if (error) return <div className="card p-5">Error: {error}</div>
  if (!data) return <div className="card p-5">Loading…</div>

  const s = data.scan
  const summary = s?.summary || {}
  const chart = [
    { name: 'files', value: summary.files || 0 },
    { name: 'dependencies', value: summary.dependencies || 0 },
    { name: 'vulnerabilities', value: summary.vulns || 0 }
  ]

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{owner}/{repo}</h3>
          <p className="text-sm text-neutral-600">Scan #{s.id} • Status: <Badge>{s.status}</Badge></p>
        </div>
        <Link href={`/repos/${owner}/${repo}`} className="btn">Open details</Link>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chart}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
