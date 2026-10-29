const { randomBytes } = require('node:crypto')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

const start = async () => {
  const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1', launchTimeout: 30000 } })
  process.env.SECRET = randomBytes(32).toString('hex')
  await mongoose.connect(mongo.getUri('bloglist_demo'))
  const app = require('../app')
  const port = Number(process.env.PORT || 3003)
  const server = app.listen(port, '127.0.0.1', () => {
    console.log(`Temporary Bloglist API ready at http://127.0.0.1:${port}`)
    console.log('All demo data is temporary and removed when this process stops.')
  })
  const stop = async () => {
    server.close()
    await mongoose.disconnect()
    await mongo.stop()
  }
  process.once('SIGINT', () => { stop().then(() => process.exit(0)) })
  process.once('SIGTERM', () => { stop().then(() => process.exit(0)) })
}

start().catch(() => {
  console.error('Temporary demo could not start.')
  process.exitCode = 1
})
