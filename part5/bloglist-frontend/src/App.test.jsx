import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const alice = { id: 'u1', username: 'alice', name: 'Alice', token: 'alice-token' }
const firstBlog = { id: 'b1', title: 'First post', author: 'Alice A', url: 'https://example.com/first', likes: 1, user: { id: 'u1', username: 'alice', name: 'Alice' } }
const popularBlog = { id: 'b2', title: 'Popular post', author: 'Bob B', url: 'https://example.com/popular', likes: 5, user: { id: 'u2', username: 'bob', name: 'Bob' } }

function reply(data, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function mockApi(handler) {
  const requests = []
  vi.stubGlobal('fetch', vi.fn((url, options = {}) => {
    const request = { url, method: options.method ?? 'GET', headers: options.headers ?? {}, body: options.body ? JSON.parse(options.body) : undefined }
    requests.push(request)
    return handler(request)
  }))
  return requests
}

function asAlice() {
  localStorage.setItem('bloglistUser', JSON.stringify(alice))
}

function deferred() {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

describe('Blog list', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('shows the login form on its public route', async () => {
    window.history.replaceState({}, '', '/login')
    mockApi(() => reply([]))
    render(<App />)
    expect(await screen.findByRole('form', { name: /log in/i })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /new blog/i })).toBeNull()
  })

  it('logs in, stores the session, reloads it, and logs out to the public list', async () => {
    window.history.replaceState({}, '', '/login')
    const requests = mockApi(({ url, method }) => {
      if (url === '/api/login' && method === 'POST') return reply(alice)
      if (url === '/api/blogs') return reply([firstBlog])
      throw new Error('Unexpected API call')
    })
    const user = userEvent.setup()
    const view = render(<App />)
    await user.type(screen.getByLabelText('Username'), 'alice')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByText(/Alice logged in/)).toBeTruthy()
    expect(await screen.findByText(/First post/)).toBeTruthy()
    expect(screen.queryByLabelText('Password')).toBeNull()
    expect(JSON.parse(localStorage.getItem('bloglistUser'))).toEqual(alice)
    expect(requests.find(item => item.url === '/api/login').body).toEqual({ username: 'alice', password: 'secret' })
    view.unmount()
    render(<App />)
    expect(await screen.findByText(/First post/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Log out' }))
    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('link', { name: 'Log in' })).toBeTruthy()
    expect(localStorage.getItem('bloglistUser')).toBeNull()
  })

  it('shows a login error and allows another attempt', async () => {
    window.history.replaceState({}, '', '/login')
    let attempts = 0
    mockApi(({ url }) => {
      if (url === '/api/blogs') return reply([])
      if (url !== '/api/login') throw new Error('Unexpected API call')
      attempts += 1
      return attempts === 1 ? reply({ error: 'invalid username or password' }, 401) : reply(alice)
    })
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Username'), 'alice')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('invalid username or password'))
    expect(localStorage.getItem('bloglistUser')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByText(/Alice logged in/)).toBeTruthy()
  })

  it('opens creation on demand, guards pending submission, and closes after success', async () => {
    asAlice()
    const pending = deferred()
    const requests = mockApi(({ url, method }) => {
      if (method === 'GET') return reply([])
      if (url === '/api/blogs' && method === 'POST') return pending.promise
      throw new Error('Unexpected API call')
    })
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('button', { name: 'New blog' })
    expect(screen.queryByRole('form', { name: 'Create blog' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'New blog' }))
    await user.type(screen.getByLabelText('Title'), 'New post')
    await user.type(screen.getByLabelText('Author'), 'Alice A')
    await user.type(screen.getByLabelText('URL'), 'https://example.com/new')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(screen.getByRole('button', { name: 'Creating…' }).disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Cancel' }).disabled).toBe(true)
    expect(requests.filter(item => item.method === 'POST')).toHaveLength(1)
    expect(requests.find(item => item.method === 'POST')).toMatchObject({ headers: { Authorization: 'Bearer alice-token' }, body: { title: 'New post', author: 'Alice A', url: 'https://example.com/new' } })
    pending.resolve(reply({ ...firstBlog, id: 'b3', title: 'New post', likes: 0 }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    expect(within(screen.getByRole('article')).getByText('New post')).toBeTruthy()
    expect(screen.queryByRole('form', { name: 'Create blog' })).toBeNull()
    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('alert').textContent).toContain('New post')
  })

  it('shows creation failures, preserves input, and lets cancel close the form', async () => {
    asAlice()
    mockApi(({ method }) => method === 'GET' ? reply([]) : reply({ error: 'URL is required' }, 400))
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'New blog' }))
    await user.type(screen.getByLabelText('Title'), 'Draft')
    await user.type(screen.getByLabelText('URL'), 'https://example.com/draft')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('URL is required'))
    expect(screen.getByLabelText('Title').value).toBe('Draft')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('form', { name: 'Create blog' })).toBeNull()
  })

  it('sorts by likes and keeps creator visible after liking', async () => {
    asAlice()
    const requests = mockApi(({ method }) => method === 'GET' ? reply([firstBlog, popularBlog]) : reply({ ...firstBlog, likes: 6 }))
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText(/Popular post/)
    const articles = screen.getAllByRole('article')
    expect(articles[0].textContent).toContain('Popular post')
    await user.click(within(articles[1]).getByRole('link', { name: 'First post' }))
    expect(screen.getByText('https://example.com/first')).toBeTruthy()
    expect(screen.getByText('Added by Alice')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Like', exact: true }))
    expect(await screen.findByText('Likes: 6')).toBeTruthy()
    expect(screen.getByText('Added by Alice')).toBeTruthy()
    expect(requests.find(item => item.method === 'PUT').body).toEqual({
      title: 'First post', author: 'Alice A', url: 'https://example.com/first', likes: 2, user: 'u1',
    })
    await user.click(screen.getByRole('link', { name: 'Blogs', exact: true }))
    expect(screen.getAllByRole('article')[0].textContent).toContain('First post')
    expect(screen.getAllByRole('article')[0].textContent).toContain('6')
  })

  it('leaves likes unchanged and reports a failed like', async () => {
    asAlice()
    const pending = deferred()
    const requests = mockApi(({ method }) => method === 'GET' ? reply([firstBlog]) : pending.promise)
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('link', { name: 'First post' }))
    await user.click(screen.getByRole('button', { name: 'Like' }))
    expect(screen.getByRole('button', { name: 'Like' }).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Like' }))
    expect(requests.filter(item => item.method === 'PUT')).toHaveLength(1)
    pending.resolve(reply({ error: 'update unavailable' }, 503))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('update unavailable'))
    expect(screen.getByRole('article').textContent).toContain('Likes: 1')
    expect(screen.getByRole('button', { name: 'Like' }).disabled).toBe(false)
  })

  it('shows delete only for the creator and confirms before deleting', async () => {
    asAlice()
    const requests = mockApi(({ method }) => method === 'GET' ? reply([firstBlog, popularBlog]) : reply(null, 204))
    const confirm = vi.fn(() => true)
    vi.stubGlobal('confirm', confirm)
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText(/Popular post/)
    await user.click(screen.getByRole('link', { name: 'Popular post' }))
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
    await user.click(screen.getByRole('link', { name: 'Blogs', exact: true }))
    await user.click(screen.getByRole('link', { name: 'First post' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    expect(screen.getByRole('article').textContent).toContain('Popular post')
    expect(window.location.pathname).toBe('/')
    expect(confirm).toHaveBeenCalledOnce()
    expect(requests.find(item => item.method === 'DELETE').headers.Authorization).toBe('Bearer alice-token')
  })

  it('keeps a blog on cancelled or failed deletion', async () => {
    asAlice()
    mockApi(({ method }) => method === 'GET' ? reply([firstBlog]) : reply({ error: 'forbidden' }, 403))
    const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true)
    vi.stubGlobal('confirm', confirm)
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('link', { name: 'First post' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText(/First post/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('forbidden'))
    expect(screen.getByText(/First post/)).toBeTruthy()
  })

  it('recovers from malformed storage and gives a load retry', async () => {
    localStorage.setItem('bloglistUser', '{bad json')
    mockApi(() => reply([]))
    render(<App />)
    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('link', { name: 'Log in' })).toBeTruthy()
    expect(localStorage.getItem('bloglistUser')).toBeNull()
    cleanup()
    asAlice()
    let loads = 0
    mockApi(() => { loads += 1; return loads === 1 ? reply({ error: 'temporary outage' }, 503) : reply([firstBlog]) })
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByText(/temporary outage/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'New blog' }).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Retry loading blogs' }))
    expect(await screen.findByText(/First post/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'New blog' }).disabled).toBe(false)
  })

  it('rejects a stored session with an object where the display name belongs', () => {
    localStorage.setItem('bloglistUser', JSON.stringify({ id: 'u1', username: 'alice', token: 'alice-token', name: { bad: true } }))
    mockApi(() => reply([]))
    render(<App />)
    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('link', { name: 'Log in' })).toBeTruthy()
    expect(localStorage.getItem('bloglistUser')).toBeNull()
  })

  it('waits for the current StrictMode load before creation and keeps existing blogs when an older load resolves late', async () => {
    asAlice()
    const firstLoad = deferred()
    const secondLoad = deferred()
    let loads = 0
    mockApi(({ method }) => {
      if (method === 'GET') {
        loads += 1
        return loads === 1 ? firstLoad.promise : secondLoad.promise
      }
      if (method === 'POST') return reply({ ...firstBlog, id: 'b3', title: 'New post', likes: 0 })
      throw new Error('Unexpected API call')
    })
    const user = userEvent.setup()
    render(<StrictMode><App /></StrictMode>)
    await waitFor(() => expect(loads).toBe(2))
    expect(screen.getByRole('button', { name: 'New blog' }).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'New blog' }))
    expect(screen.queryByRole('form', { name: 'Create blog' })).toBeNull()
    await act(async () => { secondLoad.resolve(reply([firstBlog])) })
    expect(within(screen.getByRole('article')).getByText('First post')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'New blog' }).disabled).toBe(false)
    await user.click(screen.getByRole('button', { name: 'New blog' }))
    await user.type(screen.getByLabelText('Title'), 'New post')
    await user.type(screen.getByLabelText('URL'), 'https://example.com/new')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(2))
    await act(async () => { firstLoad.resolve(reply([popularBlog])) })
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByText('First post')).toBeTruthy()
    expect(screen.getByText('New post')).toBeTruthy()
    expect(screen.queryByText('Popular post')).toBeNull()
  })

  it('ignores an old creation response after logout', async () => {
    asAlice()
    const pending = deferred()
    mockApi(({ method }) => method === 'GET' ? reply([]) : pending.promise)
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'New blog' }))
    await user.type(screen.getByLabelText('Title'), 'Late post')
    await user.type(screen.getByLabelText('URL'), 'https://example.com/late')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    await user.click(screen.getByRole('button', { name: 'Log out' }))
    pending.resolve(reply({ ...firstBlog, title: 'Late post' }))
    await waitFor(() => expect(screen.getByRole('link', { name: 'Log in' })).toBeTruthy())
    expect(window.location.pathname).toBe('/')
    expect(screen.queryByText(/Late post/)).toBeNull()
    expect(localStorage.getItem('bloglistUser')).toBeNull()
  })

  it('guards duplicate login submissions and ignores the old public load after signing in', async () => {
    window.history.replaceState({}, '', '/login')
    const publicLoad = deferred()
    const pendingLogin = deferred()
    let loads = 0
    const requests = mockApi(({ url }) => {
      if (url === '/api/login') return pendingLogin.promise
      loads += 1
      return loads === 1 ? publicLoad.promise : reply([firstBlog])
    })
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Username'), 'alice')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(screen.getByRole('button', { name: 'Logging in…' }).disabled).toBe(true)
    fireEvent.submit(screen.getByRole('form', { name: 'Log in' }))
    expect(requests.filter(item => item.url === '/api/login')).toHaveLength(1)
    await act(async () => { pendingLogin.resolve(reply(alice)) })
    expect(await screen.findByRole('link', { name: 'First post' })).toBeTruthy()
    await act(async () => { publicLoad.resolve(reply([popularBlog])) })
    expect(screen.getByRole('link', { name: 'First post' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Popular post' })).toBeNull()
    expect(window.location.pathname).toBe('/')
  })

  it('ignores a late like response after logout and reloads the public list', async () => {
    asAlice()
    const pendingLike = deferred()
    mockApi(({ method }) => method === 'GET' ? reply([firstBlog]) : pendingLike.promise)
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('link', { name: 'First post' }))
    await user.click(screen.getByRole('button', { name: 'Like', exact: true }))
    await user.click(screen.getByRole('button', { name: 'Log out' }))
    expect(await screen.findByRole('link', { name: 'First post' })).toBeTruthy()
    await act(async () => { pendingLike.resolve(reply({ ...firstBlog, likes: 99 })) })
    expect(screen.getByText('Likes: 1')).toBeTruthy()
    expect(screen.queryByText('Likes: 99')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(window.location.pathname).toBe('/')
  })

})
