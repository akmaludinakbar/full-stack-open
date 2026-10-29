const { test, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')
const request = require('supertest')

process.env.SECRET = 'temporary-test-secret-for-bloglist-only'
const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')

let mongo

before(async () => {
  mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1', launchTimeout: 30000 } })
  await mongoose.connect(mongo.getUri('bloglist_test'))
  await User.init()
})

after(async () => {
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
})

const createUser = async (username = 'ada', password = 'password123', name = 'Ada') => {
  const result = await request(app).post('/api/users').send({ username, password, name })
  assert.equal(result.status, 201)
  return result.body
}

const login = async (username = 'ada', password = 'password123') => {
  const result = await request(app).post('/api/login').send({ username, password })
  assert.equal(result.status, 200)
  return result.body
}

const createBlog = (token, body = { title: 'First post', author: 'Ada', url: 'https://example.test/first', likes: 4 }) => (
  request(app).post('/api/blogs').set('Authorization', `Bearer ${token}`).send(body)
)

test('user creation hashes password and GET users excludes hashes', async () => {
  const created = await createUser()
  assert.equal(created.username, 'ada')
  assert.equal(typeof created.id, 'string')
  assert.equal('passwordHash' in created, false)
  const saved = await User.findOne({ username: 'ada' })
  assert.notEqual(saved.passwordHash, 'password123')
  const listed = await request(app).get('/api/users').expect(200).expect('Content-Type', /json/)
  assert.equal(listed.body.length, 1)
  assert.deepEqual(listed.body[0].blogs, [])
  assert.equal('passwordHash' in listed.body[0], false)
  assert.equal('_id' in listed.body[0], false)
})

test('invalid or duplicate users return 400 and are not saved', async () => {
  await createUser()
  for (const body of [
    { username: '', password: 'valid' },
    { username: 'ab', password: 'valid' },
    { username: 'new', password: '' },
    { username: 'new', password: 'ab' },
    { username: 'ada', password: 'valid' },
  ]) {
    const result = await request(app).post('/api/users').send(body).expect(400)
    assert.equal(typeof result.body.error, 'string')
  }
  assert.equal(await User.countDocuments({}), 1)
})

test('POST users without a body returns 400 and creates no user', async () => {
  const result = await request(app).post('/api/users').expect(400)
  assert.equal(typeof result.body.error, 'string')
  assert.equal(await User.countDocuments({}), 0)
})

test('login returns identity and token, wrong credentials return 401', async () => {
  const user = await createUser()
  const result = await login()
  assert.equal(result.username, 'ada')
  assert.equal(result.name, 'Ada')
  assert.equal(result.id, user.id)
  assert.equal(typeof result.token, 'string')
  await request(app).post('/api/login').send({ username: 'ada', password: 'wrong' }).expect(401)
  await request(app).post('/api/login').send({ username: 'absent', password: 'password123' }).expect(401)
})

test('POST login without a body returns 401', async () => {
  await createUser()
  const result = await request(app).post('/api/login').expect(401)
  assert.equal(result.body.error, 'invalid username or password')
  assert.equal(await User.countDocuments({}), 1)
})

test('GET blogs is JSON with id, populated user and correct count', async () => {
  await createUser()
  const { token } = await login()
  await createBlog(token).expect(201)
  await createBlog(token, { title: 'Second', author: 'Ada', url: 'https://example.test/second' }).expect(201)
  const result = await request(app).get('/api/blogs').expect(200).expect('Content-Type', /json/)
  assert.equal(result.body.length, 2)
  assert.equal(typeof result.body[0].id, 'string')
  assert.equal('_id' in result.body[0], false)
  assert.equal('__v' in result.body[0], false)
  assert.deepEqual(Object.keys(result.body[0].user).sort(), ['id', 'name', 'username'])
  assert.equal(result.body[1].likes, 0)
})

test('POST blog persists creator and defaults missing likes to zero', async () => {
  const user = await createUser()
  const { token } = await login()
  const result = await createBlog(token, { title: 'Zero', url: 'https://example.test/zero' }).expect(201)
  assert.equal(result.body.likes, 0)
  assert.equal(result.body.user.id, user.id)
  assert.equal(await Blog.countDocuments({}), 1)
  const users = await request(app).get('/api/users').expect(200)
  assert.equal(users.body[0].blogs[0].title, 'Zero')
  assert.equal(users.body[0].blogs[0].id, result.body.id)
})

test('POST blog rejects missing title or URL without persistence', async () => {
  await createUser()
  const { token } = await login()
  await createBlog(token, { url: 'https://example.test/one' }).expect(400)
  await createBlog(token, { title: 'No URL' }).expect(400)
  assert.equal(await Blog.countDocuments({}), 0)
})

test('authenticated POST blog without a body returns 400 and saves nothing', async () => {
  await createUser()
  const { token } = await login()
  const result = await request(app).post('/api/blogs').set('Authorization', `Bearer ${token}`).expect(400)
  assert.equal(typeof result.body.error, 'string')
  assert.equal(await Blog.countDocuments({}), 0)
})

test('POST blog requires valid bearer token', async () => {
  await createUser()
  const body = { title: 'Protected', url: 'https://example.test/protected' }
  await request(app).post('/api/blogs').send(body).expect(401)
  await request(app).post('/api/blogs').set('Authorization', 'Bearer invalid').send(body).expect(401)
  assert.equal(await Blog.countDocuments({}), 0)
})

test('only creator may delete a blog', async () => {
  await createUser()
  const { token } = await login()
  const blog = (await createBlog(token).expect(201)).body
  await createUser('grace', 'password123', 'Grace')
  const other = await login('grace', 'password123')
  await request(app).delete(`/api/blogs/${blog.id}`).expect(401)
  await request(app).delete(`/api/blogs/${blog.id}`).set('Authorization', 'Bearer invalid').expect(401)
  await request(app).delete(`/api/blogs/${blog.id}`).set('Authorization', `Bearer ${other.token}`).expect(403)
  assert.equal(await Blog.countDocuments({}), 1)
  await request(app).delete(`/api/blogs/${blog.id}`).set('Authorization', `Bearer ${token}`).expect(204)
  assert.equal(await Blog.countDocuments({}), 0)
})

test('PUT changes likes while preserving the creator', async () => {
  const user = await createUser()
  const { token } = await login()
  const blog = (await createBlog(token).expect(201)).body
  const updated = await request(app).put(`/api/blogs/${blog.id}`).send({ likes: 9, user: '000000000000000000000000' }).expect(200)
  assert.equal(updated.body.likes, 9)
  assert.equal(updated.body.user.id, user.id)
  const saved = await Blog.findById(blog.id)
  assert.equal(String(saved.user), user.id)
})

test('PUT blog without a body returns 400 and leaves likes unchanged', async () => {
  await createUser()
  const { token } = await login()
  const blog = (await createBlog(token).expect(201)).body
  const result = await request(app).put(`/api/blogs/${blog.id}`).expect(400)
  assert.equal(result.body.error, 'likes must be a number')
  const saved = await Blog.findById(blog.id)
  assert.equal(saved.likes, 4)
})

test('invalid IDs return 400, missing IDs return 404, errors contain no stack', async () => {
  await createUser()
  const { token } = await login()
  const invalid = await request(app).get('/api/blogs/not-an-id').expect(400)
  assert.equal(typeof invalid.body.error, 'string')
  assert.equal('stack' in invalid.body, false)
  await request(app).get('/api/blogs/000000000000000000000000').expect(404)
  await request(app).put('/api/blogs/not-an-id').send({ likes: 2 }).expect(400)
  await request(app).delete('/api/blogs/000000000000000000000000').set('Authorization', `Bearer ${token}`).expect(404)
})
