
export type LocStats = { loc: number, sloc: number, complexity: number }

const textExtensions = new Set(['.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.go', '.java', '.cs', '.php', '.rs'])

export function isTextual(path: string) {
  const idx = path.lastIndexOf('.')
  if (idx === -1) return false
  return textExtensions.has(path.slice(idx))
}

export function analyzeContent(content: string): LocStats {
  const lines = content.split(/\r?\n/)
  const sloc = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('//') && !l.trim().startsWith('#')).length
  // naive complexity: count occurrences of keywords/braces
  const complexity = (content.match(/\b(if|for|while|case|catch|function|=>)\b/g) || []).length +
    (content.match(/[{}]/g) || []).length / 10
  return { loc: lines.length, sloc, complexity }
}
