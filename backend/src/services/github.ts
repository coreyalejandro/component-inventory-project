
import { makeOctokit } from '../octokit.js'

export type RepoKey = { owner: string, name: string }
export type TreeItem = { path: string, type: 'blob'|'tree', size?: number, sha: string }

export async function getRepoMeta(token: string, key: RepoKey) {
  const { rest } = makeOctokit(token)
  const { data } = await rest.rest.repos.get({ owner: key.owner, repo: key.name })
  return {
    defaultBranch: data.default_branch,
    visibility: data.private ? 'private' : 'public',
    homepage: data.homepage || null,
    topics: data.topics || []
  }
}

export async function getTreeRecursive(token: string, key: RepoKey, ref: string): Promise<TreeItem[]> {
  const { rest } = makeOctokit(token)
  const { data } = await rest.rest.git.getTree({ owner: key.owner, repo: key.name, tree_sha: ref, recursive: '1' })
  const out: TreeItem[] = []
  for (const t of data.tree) {
    if (t.type === 'blob' || t.type === 'tree') {
      out.push({ path: t.path!, type: t.type as any, size: (t as any).size, sha: t.sha! })
    }
  }
  return out
}

export async function getFileContent(token: string, key: RepoKey, path: string, ref: string): Promise<string> {
  const { rest } = makeOctokit(token)
  const { data } = await rest.rest.repos.getContent({ owner: key.owner, repo: key.name, path, ref })
  if (!('content' in data)) return ''
  const b64 = (data as any).content as string
  return Buffer.from(b64, 'base64').toString('utf8')
}
