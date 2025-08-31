import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

vi.mock('@/lib/api', () => ({ enqueueScan: vi.fn() }))

function createRequest(body: any) {
  return new NextRequest('http://localhost/api/scan', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/scan', () => {
  it('returns 400 for invalid input', async () => {
    const req = createRequest({ repo: 'repo-only', jwt: 'token' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.errors).toBeDefined()
  })
})
