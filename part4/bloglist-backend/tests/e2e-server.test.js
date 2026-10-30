/* global fetch */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const { once } = require('node:events')
const jwt = require('jsonwebtoken')

const start = (env) => spawn(process.execPath, [require.resolve('../scripts/e2e-server.js')], {
  env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'],
})

test('E2E server refuses non-test mode before opening a database', async () => {
  const child = start({ NODE_ENV: 'production', MONGODB_URI: 'mongodb://127.0.0.1:1/never_use_external' })
  let errors = ''
  child.stderr.on('data', data => { errors += data })
  const [code] = await once(child, 'exit')
  assert.equal(code, 1)
  assert.match(errors, /requires NODE_ENV=test/)
})

test('E2E server overrides incoming URI and secret, resets real data, and closes on SIGTERM', { timeout: 45000 }, async (t) => {
  const child = start({
    NODE_ENV: 'test', PORT: '0',
    MONGODB_URI: 'mongodb://127.0.0.1:1/never_use_external',
    SECRET: 'external-secret-must-not-be-used',
  })
  const exited = once(child, 'exit')
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM')
    await exited
  })
  const ready = new Promise((resolve, reject) => {
    let output = ''
    child.stdout.on('data', data => {
      output += data
      const match = output.match(/ready at (http:\/\/127\.0\.0\.1:\d+)/)
      if (match) resolve(match[1])
    })
    child.once('exit', code => reject(new Error(`E2E server exited before readiness: ${code}`)))
  })
  const base = await ready
  const post = (route, body) => fetch(`${base}${route}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  assert.equal((await post('/api/users', { username: 'isolated', name: 'Isolated', password: 'synthetic-password' })).status, 201)
  const loggedIn = await post('/api/login', { username: 'isolated', password: 'synthetic-password' })
  assert.equal(loggedIn.status, 200)
  const { token } = await loggedIn.json()
  assert.throws(() => jwt.verify(token, 'external-secret-must-not-be-used'), /invalid signature/)
  assert.equal((await post('/api/testing/reset')).status, 204)
  assert.deepEqual(await (await fetch(`${base}/api/users`)).json(), [])
  child.kill('SIGTERM')
  const [code, signal] = await exited
  assert.equal(code, 0)
  assert.equal(signal, null)
  await assert.rejects(fetch(`${base}/api/blogs`))
})
