
import { NextRequest, NextResponse } from 'next/server'
import { getInventory } from '@/lib/api'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const owner = searchParams.get('owner') || ''
  const repo = searchParams.get('repo') || ''
  if (!owner || !repo) return NextResponse.json({ error: 'owner and repo required' }, { status: 400 })
  const data = await getInventory(owner, repo)
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(data, { status: 200 })
}
