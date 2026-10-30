import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const blog = { id: 'b1', title: 'Public reading', author: 'Ada', url: 'https://example.com', likes: 3, user: { id: 'u1', name: 'Alice' } }
function response(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } }) }
beforeEach(() => {
  localStorage.clear()
  window.history.replaceState({}, '', '/')
  vi.stubGlobal('fetch', vi.fn(async () => response([blog])))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
it('public listing links to a readable detail without mutation controls', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(await screen.findByRole('link', { name: 'Public reading' }))
  expect(window.location.pathname).toBe('/blogs/b1')
  expect(await screen.findByRole('link', { name: blog.url })).toBeTruthy()
  expect(screen.getByText('Likes: 3')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Like', exact: true })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'New blog' })).toBeNull()
})
it('supports a direct detail URL and distinguishes loading from missing', async () => {
  window.history.replaceState({}, '', '/blogs/b1')
  render(<App />)
  expect(screen.getByRole('status').textContent).toContain('Loading')
  expect(screen.queryByText('Blog not found')).toBeNull()
  expect(await screen.findByText('Likes: 3')).toBeTruthy()
})
it('shows a recoverable missing blog page', async () => {
  window.history.replaceState({}, '', '/blogs/missing')
  render(<App />)
  expect(await screen.findByText('Blog not found')).toBeTruthy()
  await userEvent.setup().click(screen.getByRole('link', { name: 'Back to blogs' }))
  expect(window.location.pathname).toBe('/')
  expect(await screen.findByRole('link', { name: 'Public reading' })).toBeTruthy()
})
it('retries a failed direct detail load without claiming the blog is missing', async () => {
  window.history.replaceState({}, '', '/blogs/b1')
  fetch.mockResolvedValueOnce(response({ error: 'temporarily unavailable' }, 503))
  render(<App />)
  expect(await screen.findByText(/temporarily unavailable/)).toBeTruthy()
  expect(screen.queryByText('Blog not found')).toBeNull()
  await userEvent.setup().click(screen.getByRole('button', { name: 'Retry loading blogs' }))
  expect(await screen.findByText('Likes: 3')).toBeTruthy()
})
it('redirects a guest creation URL to login and never displays the create form', async () => {
  window.history.replaceState({}, '', '/blogs/new')
  render(<App />)
  expect(await screen.findByRole('form', { name: 'Log in' })).toBeTruthy()
  expect(window.location.pathname).toBe('/login')
  expect(screen.queryByRole('form', { name: 'Create blog' })).toBeNull()
})
it('redirects an authenticated login URL to the list', async () => {
  localStorage.setItem('bloglistUser', JSON.stringify({ id: 'u1', username: 'alice', token: 'token' }))
  window.history.replaceState({}, '', '/login')
  render(<App />)
  expect(await screen.findByRole('link', { name: 'Public reading' })).toBeTruthy()
  expect(window.location.pathname).toBe('/')
  expect(screen.queryByRole('form', { name: 'Log in' })).toBeNull()
})


it('holds a direct authenticated creation route until the list loads, then cancels to home', async () => {
  let resolve
  const pending = new Promise(done => { resolve = done })
  fetch.mockReturnValueOnce(pending)
  localStorage.setItem('bloglistUser', JSON.stringify({ id: 'u1', username: 'alice', token: 'token' }))
  window.history.replaceState({}, '', '/blogs/new')
  render(<App />)
  expect(screen.getByRole('status').textContent).toContain('Loading')
  expect(screen.queryByRole('form', { name: 'Create blog' })).toBeNull()
  resolve(response([blog]))
  expect(await screen.findByRole('form', { name: 'Create blog' })).toBeTruthy()
  await userEvent.setup().click(screen.getByRole('button', { name: 'Cancel' }))
  expect(window.location.pathname).toBe('/')
  expect(screen.getByRole('link', { name: 'Public reading' })).toBeTruthy()
})
