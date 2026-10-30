const { test, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')

let mongo
let disposableApp
before(async () => {
  mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1', launchTimeout: 30000 } })
  await mongoose.connect(mongo.getUri('bloglist_reset_test'))
  disposableApp = app.createApp({ testingRouter: require('../controllers/testing') })
})
after(async () => {
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
})
beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  const user = await User.create({ username: 'reset-user', name: 'Reset User', passwordHash: 'synthetic-hash' })
  await Blog.create({ title: 'Reset me', url: 'https://example.test/reset', user: user.id })
})

// Catches a missing reset route or a route that leaves either collection populated.
test('test-only reset deletes blogs and users and can be repeated', async () => {
  await request(disposableApp).post('/api/testing/reset').expect(204)
  assert.equal(await Blog.countDocuments({}), 0)
  assert.equal(await User.countDocuments({}), 0)
  await request(disposableApp).post('/api/testing/reset').expect(204)
})

// Catches reset exposure in ordinary callers that happen to run with NODE_ENV=test.
test('ordinary app in test mode returns 404 for reset and preserves data', async () => {
  assert.equal(process.env.NODE_ENV, 'test')
  await request(app).post('/api/testing/reset').expect(404)
  assert.equal(await Blog.countDocuments({}), 1)
  assert.equal(await User.countDocuments({}), 1)
})

// Catches accidental registration of the destructive route outside test mode.
test('non-test app rejects an injected reset router without deleting any data', async () => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  delete require.cache[require.resolve('../app')]
  try {
    const productionApp = require('../app').createApp({ testingRouter: require('../controllers/testing') })
    await request(productionApp).post('/api/testing/reset').expect(404)
    assert.equal(await Blog.countDocuments({}), 1)
    assert.equal(await User.countDocuments({}), 1)
  } finally {
    process.env.NODE_ENV = previousEnv
    delete require.cache[require.resolve('../app')]
  }
})
