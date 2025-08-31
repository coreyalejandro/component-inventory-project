
import fetch from 'node-fetch'

export type OsvQuery = {
  version: string
  package: { name: string, ecosystem: string }
}

export async function queryOSV(batch: OsvQuery[]) {
  const resp = await fetch('https://api.osv.dev/v1/querybatch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ queries: batch })
  })
  if (!resp.ok) {
    throw new Error(`OSV error: ${resp.status}`)
  }
  return resp.json() as Promise<{ results: Array<{ vulns?: Array<{ id: string, summary?: string, severity?: Array<{ type: string, score: string }>, references?: Array<{ type: string, url: string }> }> }> }>
}
