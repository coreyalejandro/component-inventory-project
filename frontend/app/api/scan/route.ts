
import { NextRequest, NextResponse } from 'next/server'
import { enqueueScan } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { owner, repo, gitRef, jwt } = body || {}
    if (!owner || !repo || !jwt) return NextResponse.json({ error: 'owner, repo, jwt required' }, { status: 400 })
    const out = await enqueueScan({ owner, repo, gitRef, jwt })
    return NextResponse.json(out, { status: 200 })
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'error' }, { status: 500 })
  }
}
