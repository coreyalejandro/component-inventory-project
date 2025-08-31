
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { enqueueScan } from '@/lib/api'

const scanRequestSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  gitRef: z.string().optional(),
  jwt: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = scanRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 })
    }
    const { owner, repo, gitRef, jwt } = parsed.data
    const out = await enqueueScan({ owner, repo, gitRef, jwt })
    return NextResponse.json(out, { status: 200 })
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'error' }, { status: 500 })
  }
}
