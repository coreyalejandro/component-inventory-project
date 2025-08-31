
import { getInventory } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function RepoPage({ params }: { params: { owner: string; repo: string } }) {
  const data = await getInventory(params.owner, params.repo)
  if (!data) {
    return <div className="card p-5">No scans yet for {params.owner}/{params.repo}</div>
  }
  const { scan } = data
  const s = scan.summary || {}
  return (
    <main className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{params.owner}/{params.repo}</CardTitle>
          <CardDescription>Scan #{scan.id} • Status: {scan.status}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4"><div className="text-sm text-neutral-500">Files</div><div className="text-2xl font-semibold">{s.files ?? 0}</div></div>
            <div className="card p-4"><div className="text-sm text-neutral-500">Dependencies</div><div className="text-2xl font-semibold">{s.dependencies ?? 0}</div></div>
            <div className="card p-4"><div className="text-sm text-neutral-500">Vulnerabilities</div><div className="text-2xl font-semibold">{s.vulns ?? 0}</div></div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
