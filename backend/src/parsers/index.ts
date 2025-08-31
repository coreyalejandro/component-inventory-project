
import { parse as parseYAML } from 'yaml'

export type Dep = { ecosystem: string, name: string, version: string, scope: 'direct' | 'transitive' }

export function parseNodeManifests(files: Record<string, string>): Dep[] {
  const out: Dep[] = []
  if (files['package.json']) {
    try {
      const pkg = JSON.parse(files['package.json'])
      const add = (deps: Record<string,string>|undefined, scope: 'direct'|'transitive'='direct') => {
        if (!deps) return
        for (const [name, version] of Object.entries(deps)) out.push({ ecosystem: 'npm', name, version, scope })
      }
      add(pkg.dependencies, 'direct')
      add(pkg.devDependencies, 'direct')
    } catch {}
  }
  if (files['package-lock.json']) {
    try {
      const lock = JSON.parse(files['package-lock.json'])
      if (lock.packages) {
        for (const [name, meta] of Object.entries<any>(lock.packages)) {
          if (!name || name === '') continue
          if (!meta.version) continue
          out.push({ ecosystem: 'npm', name, version: meta.version, scope: 'transitive' })
        }
      }
    } catch {}
  }
  if (files['pnpm-lock.yaml']) {
    try {
      const lock = parseYAML(files['pnpm-lock.yaml'])
      const importers = lock.importers || {}
      Object.values<any>(importers).forEach((imp: any) => {
        const add = (deps: any) => {
          if (!deps) return
          for (const [name, version] of Object.entries<any>(deps)) {
            out.push({ ecosystem: 'npm', name, version: String(version), scope: 'transitive' })
          }
        }
        add(imp.dependencies); add(imp.devDependencies); add(imp.optionalDependencies)
      })
    } catch {}
  }
  if (files['yarn.lock']) {
    // Yarn v1 lock parsing is non-trivial; for brevity, treat as presence signal only (direct deps already captured).
  }
  return dedupe(out)
}

export function parsePython(files: Record<string,string>): Dep[] {
  const out: Dep[] = []
  if (files['requirements.txt']) {
    const lines = files['requirements.txt'].split(/\r?\n/)
    for (const line of lines) {
      const m = line.match(/^([A-Za-z0-9_.\-]+)==([A-Za-z0-9_.\-]+)/)
      if (m) out.push({ ecosystem: 'PyPI', name: m[1], version: m[2], scope: 'direct' })
    }
  }
  // poetry.lock parsing omitted for brevity
  return dedupe(out)
}

export function parseGo(files: Record<string,string>): Dep[] {
  const out: Dep[] = []
  if (files['go.mod']) {
    const lines = files['go.mod'].split(/\r?\n/)
    for (const l of lines) {
      const m = l.trim().match(/^require\s+([^\s]+)\s+v([0-9][^\s]*)/)
      if (m) out.push({ ecosystem: 'Go', name: m[1], version: m[2], scope: 'direct' })
    }
  }
  return dedupe(out)
}

export function dedupe(deps: Dep[]): Dep[] {
  const map = new Map<string, Dep>()
  for (const d of deps) {
    const key = `${d.ecosystem}:${d.name}@${d.version}:${d.scope}`
    map.set(key, d)
  }
  return Array.from(map.values())
}
