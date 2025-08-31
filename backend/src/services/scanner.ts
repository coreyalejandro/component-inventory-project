
import type { Pool } from 'pg'
import type { RepoKey } from './github.js'
import { getRepoMeta, getTreeRecursive, getFileContent } from './github.js'
import { isTextual, analyzeContent } from '../util/loc.js'
import { parseNodeManifests, parsePython, parseGo, type Dep } from '../parsers/index.js'
import { queryOSV, type OsvQuery } from './osv.js'

export type ScanSummary = {
  files: number
  dependencies: number
  vulns: number
  issues?: number
  prs?: number
}

export async function runScan(db: Pool, token: string, key: RepoKey, gitRef: string = 'main') {
  // Upsert repository
  const meta = await getRepoMeta(token, key)
  const repoRes = await db.query(
    `INSERT INTO repositories(owner, name, default_branch, visibility, homepage, topics)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT(owner, name) DO UPDATE SET default_branch=EXCLUDED.default_branch, visibility=EXCLUDED.visibility, homepage=EXCLUDED.homepage, topics=EXCLUDED.topics, updated_at=NOW()
     RETURNING id`,
    [key.owner, key.name, meta.defaultBranch, meta.visibility, meta.homepage, JSON.stringify(meta.topics)]
  )
  const repoId = repoRes.rows[0].id as number
  const scanRes = await db.query(
    `INSERT INTO scans(repository_id, status, git_ref) VALUES ($1,'running',$2) RETURNING id`,
    [repoId, gitRef]
  )
  const scanId = scanRes.rows[0].id as number

  try {
    const tree = await getTreeRecursive(token, key, gitRef)
    let fileCount = 0
    const files: Record<string,string> = {}
    const MAX_FETCH_BYTES = 5 * 1024 * 1024
    let fetchedBytes = 0
    for (const item of tree) {
      if (item.type === 'blob') {
        fileCount++
        // Opportunistically fetch content for small textual files to compute LOC
        if (item.size && item.size < 100_000 && isTextual(item.path) && fetchedBytes < MAX_FETCH_BYTES) {
          const content = await getFileContent(token, key, item.path, gitRef)
          files[item.path.split('/').pop() || item.path] = content
          fetchedBytes += Buffer.byteLength(content, 'utf8')
        }
      }
    }

    // Dependency parsing
    const deps: Dep[] = []
    deps.push(...parseNodeManifests(files))
    deps.push(...parsePython(files))
    deps.push(...parseGo(files))

    // Vulnerability lookup (OSV)
    const osvQueries: OsvQuery[] = deps.map(d => ({
      version: d.version.replace('^','').replace('~',''),
      package: { name: d.name, ecosystem: mapEcosystem(d.ecosystem) }
    }))
    const osvRes = await queryOSV(osvQueries)
    let vulnCount = 0
    for (let i=0;i<deps.length;i++) {
      const vulns = osvRes.results[i]?.vulns || []
      vulnCount += vulns.length
    }

    const summary: ScanSummary = {
      files: fileCount,
      dependencies: deps.length,
      vulns: vulnCount
    }

    await db.query('UPDATE scans SET status=$1, finished_at=NOW(), summary=$2 WHERE id=$3', ['succeeded', summary, scanId])
    return { scanId, summary }
  } catch (err: any) {
    await db.query('UPDATE scans SET status=$1, finished_at=NOW(), summary=$2 WHERE id=$3', ['failed', { error: err.message }, scanId])
    throw err
  }
}

function mapEcosystem(ec: string) {
  switch (ec) {
    case 'npm': return 'npm'
    case 'PyPI': return 'PyPI'
    case 'Go': return 'Go'
    default: return ec
  }
}
