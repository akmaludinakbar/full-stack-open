const { randomBytes } = require('node:crypto')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

// Refuse to start unless explicitly selected as a test process. Incoming database
// configuration is never used, even if a developer has exported an Atlas URI.
if (process.env.NODE_ENV !== 'test') {
  console.error('E2E server requires NODE_ENV=test')
  process.exit(1)
}
process.env.MONGODB_URI = ''
process.env.SECRET = randomBytes(32).toString('hex')

let mongo
let server
let stopping
let startup

const stop = () => {
  stopping ??= (async () => {
    // A signal during startup must not leave a newly started database behind.
    await startup.catch(() => {})
    if (server?.listening) await new Promise(resolve => server.close(resolve))
    await mongoose.disconnect()
    if (mongo) await mongo.stop()
  })()
  return stopping
}

process.once('SIGINT', () => { void stop().then(() => process.exit(0)) })
process.once('SIGTERM', () => { void stop().then(() => process.exit(0)) })

startup = (async () => {
  const port = Number(process.env.PORT || 3305)
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid E2E port')
  mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1', launchTimeout: 30000 } })
  process.env.MONGODB_URI = mongo.getUri('bloglist_e2e')
  await mongoose.connect(process.env.MONGODB_URI)
  const User = require('../models/user')
  await User.init()
  // Inject reset only after this launcher owns and connects its temporary DB.
  const { createApp } = require('../app')
  const app = createApp({ testingRouter: require('../controllers/testing') })
  await new Promise((resolve, reject) => {
    server = app.listen(port, '127.0.0.1', resolve)
    server.once('error', reject)
  })
  console.log(`Disposable E2E API ready at http://127.0.0.1:${server.address().port}`)
})()

startup.catch(async () => {
  console.error('Disposable E2E API could not start')
  await stop()
  process.exitCode = 1
})
