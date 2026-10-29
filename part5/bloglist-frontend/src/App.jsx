import { useEffect, useRef, useState } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import { createBlog, deleteBlog, getBlogs, likeBlog, setToken } from './services/blogs'
import { login } from './services/login'

const storageKey = 'bloglistUser'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const saved = JSON.parse(raw)
    if (typeof saved?.token === 'string' && saved.token &&
        typeof saved?.username === 'string' && saved.username &&
        typeof saved?.id === 'string' && saved.id &&
        (saved.name === undefined || typeof saved.name === 'string')) {
      return { token: saved.token, username: saved.username, id: saved.id, name: saved.name }
    }
    localStorage.removeItem(storageKey)
  } catch {
    try { localStorage.removeItem(storageKey) } catch { /* Storage can be unavailable. */ }
  }
  return null
}

function errorText(error) {
  return error instanceof Error ? error.message : 'Unexpected request error'
}

export default function App() {
  const [user, setUser] = useState(readStoredUser)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [blogs, setBlogs] = useState([])
  const [notification, setNotification] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [creating, setCreating] = useState(false)
  const [loginPending, setLoginPending] = useState(false)
  const [createPending, setCreatePending] = useState(false)
  const [busyIds, setBusyIds] = useState([])
  const session = useRef(0)
  const loadSequence = useRef(0)
  const mutationSequence = useRef(0)
  const loaded = useRef(false)
  const loadInFlight = useRef(false)
  const loginBusy = useRef(false)
  const createBusy = useRef(false)
  const blogBusy = useRef(new Set())

  useEffect(() => {
    setToken(user?.token ?? null)
  }, [user])

  useEffect(() => {
    if (!notification) return undefined
    const timer = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(timer)
  }, [notification])

  async function loadBlogs(currentSession) {
    const currentLoad = ++loadSequence.current
    const currentMutation = mutationSequence.current
    loadInFlight.current = true
    setLoading(true)
    setLoadError('')
    try {
      const fetched = await getBlogs()
      if (session.current === currentSession && loadSequence.current === currentLoad && mutationSequence.current === currentMutation) {
        loaded.current = true
        setHasLoaded(true)
        setBlogs(fetched)
      }
    } catch (error) {
      if (session.current === currentSession && loadSequence.current === currentLoad && mutationSequence.current === currentMutation) {
        setLoadError(`Could not load blogs: ${errorText(error)}`)
      }
    } finally {
      if (session.current === currentSession && loadSequence.current === currentLoad) {
        loadInFlight.current = false
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (user) void loadBlogs(session.current)
  }, [user])

  async function handleLogin(event) {
    event.preventDefault()
    if (loginBusy.current) return
    loginBusy.current = true
    setLoginPending(true)
    const currentSession = session.current
    try {
      const loggedIn = await login({ username, password })
      if (session.current !== currentSession) return
      session.current += 1
      loaded.current = false
      loadInFlight.current = false
      setHasLoaded(false)
      setToken(loggedIn.token)
      localStorage.setItem(storageKey, JSON.stringify(loggedIn))
      setUser(loggedIn)
      setUsername('')
      setPassword('')
      setNotification(null)
    } catch (error) {
      if (session.current === currentSession) setNotification({ type: 'error', text: `Login failed: ${errorText(error)}` })
    } finally {
      if (session.current === currentSession || session.current === currentSession + 1) {
        loginBusy.current = false
        setLoginPending(false)
      }
    }
  }

  function handleLogout() {
    session.current += 1
    loaded.current = false
    loadInFlight.current = false
    setHasLoaded(false)
    setToken(null)
    localStorage.removeItem(storageKey)
    setUser(null)
    setBlogs([])
    setCreating(false)
    setLoadError('')
    setLoading(false)
    setNotification(null)
    setBusyIds([])
    blogBusy.current.clear()
    createBusy.current = false
    setCreatePending(false)
  }

  async function handleCreate(details) {
    if (!loaded.current || loadInFlight.current || createBusy.current) return false
    createBusy.current = true
    setCreatePending(true)
    const currentSession = session.current
    try {
      const created = await createBlog(details)
      if (session.current !== currentSession) return false
      mutationSequence.current += 1
      setBlogs(previous => [...previous, created])
      setCreating(false)
      setNotification({ type: 'success', text: `Created ${created.title}` })
      return true
    } catch (error) {
      if (session.current === currentSession) setNotification({ type: 'error', text: `Could not create blog: ${errorText(error)}` })
      return false
    } finally {
      if (session.current === currentSession) {
        createBusy.current = false
        setCreatePending(false)
      }
    }
  }

  function beginBlogAction(id) {
    if (blogBusy.current.has(id)) return false
    blogBusy.current.add(id)
    setBusyIds(previous => [...previous, id])
    return true
  }

  function endBlogAction(id, currentSession) {
    if (session.current !== currentSession) return
    blogBusy.current.delete(id)
    setBusyIds(previous => previous.filter(item => item !== id))
  }

  async function handleLike(blog) {
    if (!beginBlogAction(blog.id)) return
    const currentSession = session.current
    try {
      const updated = await likeBlog(blog)
      if (session.current !== currentSession) return
      mutationSequence.current += 1
      setBlogs(previous => previous.map(item => item.id === blog.id
        ? { ...item, ...updated, user: updated.user ?? item.user }
        : item))
    } catch (error) {
      if (session.current === currentSession) setNotification({ type: 'error', text: `Could not like blog: ${errorText(error)}` })
    } finally {
      endBlogAction(blog.id, currentSession)
    }
  }

  async function handleDelete(blog) {
    if (blogBusy.current.has(blog.id) || !window.confirm(`Delete ${blog.title}?`)) return
    if (!beginBlogAction(blog.id)) return
    const currentSession = session.current
    try {
      await deleteBlog(blog.id)
      if (session.current !== currentSession) return
      mutationSequence.current += 1
      setBlogs(previous => previous.filter(item => item.id !== blog.id))
      setNotification({ type: 'success', text: `Deleted ${blog.title}` })
    } catch (error) {
      if (session.current === currentSession) setNotification({ type: 'error', text: `Could not delete blog: ${errorText(error)}` })
    } finally {
      endBlogAction(blog.id, currentSession)
    }
  }

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  return (
    <main className="page">
      <h1>Blog list</h1>
      {notification && <div role="alert" className={`notification ${notification.type}`}>{notification.text}</div>}
      {!user ? (
        <form aria-label="Log in" onSubmit={handleLogin} className="panel form">
          <h2>Log in</h2>
          <label>Username <input autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required /></label>
          <label>Password <input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
          <button type="submit" disabled={loginPending}>{loginPending ? 'Logging in…' : 'Log in'}</button>
        </form>
      ) : (
        <>
          <div className="session"><span>{user.name || user.username} logged in</span><button type="button" onClick={handleLogout}>Log out</button></div>
          {creating ? <BlogForm onCreate={handleCreate} onCancel={() => setCreating(false)} pending={createPending} />
            : <button type="button" disabled={!hasLoaded || loading} onClick={() => {
              if (loaded.current && !loadInFlight.current) setCreating(true)
            }}>New blog</button>}
          <h2>Blogs</h2>
          {loading && <p role="status">Loading blogs…</p>}
          {loadError && <div className="load-error"><p>{loadError}</p><button type="button" onClick={() => void loadBlogs(session.current)} disabled={loading}>Retry loading blogs</button></div>}
          <div className="blog-list">
            {sortedBlogs.map(blog => <Blog key={blog.id} blog={blog} ownerId={user.id} busy={busyIds.includes(blog.id)} onLike={handleLike} onDelete={handleDelete} />)}
          </div>
        </>
      )}
    </main>
  )
}
