
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
if (!backendUrl) throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined')
export const BACKEND_URL = backendUrl

// Server-side proxy helpers
export async function enqueueScan(input: { owner: string; repo: string; gitRef?: string; jwt: string }) {
  const res = await fetch(`${BACKEND_URL}/v1/repos/scan`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${input.jwt}` },
    body: JSON.stringify({ owner: input.owner, repo: input.repo, gitRef: input.gitRef || 'main' }),
    cache: 'no-store'
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`enqueue failed: ${res.status} ${txt}`)
  }
  return res.json() as Promise<{ scanId: number | string }>
}

export interface ScanSummary {
  id: number
  status: string
  summary: {
    files: number
    dependencies: number
    vulns: number
    issues?: number
    prs?: number
  }
  started_at: string
  finished_at?: string
}

export async function getInventory(owner: string, repo: string) {
  const res = await fetch(`${BACKEND_URL}/v1/repos/${owner}/${repo}/inventory`, { cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`inventory error ${res.status}`)
  return res.json() as Promise<{ scan: ScanSummary }>
}
