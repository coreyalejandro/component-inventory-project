
import Fastify from 'fastify'
import swaggerPlugin from '../plugins/swagger.js'
import { writeFileSync } from 'fs'

async function run() {
  const app = Fastify()
  await app.register(swaggerPlugin)
  await app.ready()
  const doc = app.swagger()
  writeFileSync('openapi.json', JSON.stringify(doc, null, 2))
  await app.close()
  console.log('Wrote openapi.json')
}

run().catch((e) => { console.error(e); process.exit(1) })
