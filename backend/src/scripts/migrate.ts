
import { loadConfig } from '../config.js'
import { makePool } from '../db.js'
import fs from 'fs'
import path from 'path'

async function run() {
  const cfg = loadConfig()
  const db = makePool(cfg)
  const dir = path.resolve(process.cwd(), 'migrations')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort()
  for (const f of files) {
    const sql = fs.readFileSync(path.join(dir, f), 'utf8')
    await db.query(sql)
    console.log('Applied migration', f)
  }
  await db.end()
}

run().catch((e) => { console.error(e); process.exit(1) })
