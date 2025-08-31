
import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'

export default fp(async function (app) {
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: { title: 'GitInventory API', version: '1.0.0' }
    }
  })
  await app.register(swaggerUI, { routePrefix: '/docs' })
})
