import { startTransition, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link as RouterLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Alert, AppBar, Box, Button, Container, CssBaseline, Link, Paper, Stack, ThemeProvider, Toolbar, Typography, createTheme } from '@mui/material'
import BlogPage from './components/BlogPage'
import LoginForm from './components/LoginForm'
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

const theme = createTheme({
  palette: { primary: { main: '#215b55' }, background: { default: '#f4f7f6' } },
  shape: { borderRadius: 12 },
  typography: { fontFamily: 'Inter, system-ui, sans-serif' },
})

export default function App() {
  return <ThemeProvider theme={theme}><CssBaseline /><BrowserRouter><BloglistApp /></BrowserRouter></ThemeProvider>
}

function BloglistApp() {
  const navigate = useNavigate()
  const [user, setUser] = useState(readStoredUser)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [blogs, setBlogs] = useState([])
  const [notification, setNotification] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
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
    void loadBlogs(session.current)
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
      navigate('/')
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
    // Keep the auth change and navigation in the same transition so the
    // protected creation route cannot redirect logout to /login first.
    startTransition(() => {
      session.current += 1
      loaded.current = false
      loadInFlight.current = false
      setHasLoaded(false)
      setToken(null)
      localStorage.removeItem(storageKey)
      setUser(null)
      setBlogs([])
      navigate('/')
      setLoadError('')
      setLoading(false)
      setNotification(null)
      setBusyIds([])
      blogBusy.current.clear()
      createBusy.current = false
      setCreatePending(false)
    })
  }

  async function handleCreate(details) {
    if (!user || !loaded.current || loadInFlight.current || createBusy.current) return false
    createBusy.current = true
    setCreatePending(true)
    const currentSession = session.current
    try {
      const created = await createBlog(details)
      if (session.current !== currentSession) return false
      mutationSequence.current += 1
      setBlogs(previous => [...previous, created])
      navigate('/')
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
    if (!user || !beginBlogAction(blog.id)) return
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
    if (!user || blog.user?.id !== user.id || blogBusy.current.has(blog.id) || !window.confirm(`Delete ${blog.title}?`)) return
    if (!beginBlogAction(blog.id)) return
    const currentSession = session.current
    try {
      await deleteBlog(blog.id)
      if (session.current !== currentSession) return
      mutationSequence.current += 1
      setBlogs(previous => previous.filter(item => item.id !== blog.id))
      setNotification({ type: 'success', text: `Deleted ${blog.title}` })
      navigate('/')
    } catch (error) {
      if (session.current === currentSession) setNotification({ type: 'error', text: `Could not delete blog: ${errorText(error)}` })
    } finally {
      endBlogAction(blog.id, currentSession)
    }
  }

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  const loadStatus = <>
    {loading && <Typography role="status" sx={{ py: 2 }}>Loading blogs…</Typography>}
    {loadError && <Alert severity="error" sx={{ my: 2 }} action={<Button color="inherit" onClick={() => void loadBlogs(session.current)} disabled={loading}>Retry loading blogs</Button>}>{loadError}</Alert>}
  </>

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar component="nav" aria-label="Main navigation" sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
          <Typography component="span" variant="h6" sx={{ mr: 1 }}>Blog list</Typography>
          <Button component={RouterLink} to="/" color="inherit">Blogs</Button>
          {user && <Button color="inherit" disabled={!hasLoaded || loading} onClick={() => {
            if (loaded.current && !loadInFlight.current) navigate('/blogs/new')
          }}>New blog</Button>}
          <Box sx={{ flexGrow: 1 }} />
          {user ? <>
            <Typography>{user.name || user.username} logged in</Typography>
            <Button color="inherit" onClick={handleLogout}>Log out</Button>
          </> : <Button component={RouterLink} to="/login" color="inherit">Log in</Button>}
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        {notification && <Alert severity={notification.type} sx={{ mb: 3 }}>{notification.text}</Alert>}
        <Routes>
          <Route path="/" element={<>
            <Typography variant="h4" component="h1" gutterBottom>Blogs</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Read, share, and discover ideas. Most liked stories appear first.</Typography>
            {loadStatus}
            {!loading && !loadError && hasLoaded && blogs.length === 0 && <Typography>No blogs yet.</Typography>}
            <Stack spacing={2} className="blog-list">
              {sortedBlogs.map(blog => <Paper component="article" variant="outlined" key={blog.id} sx={{ p: 2.5 }}>
                <Link component={RouterLink} to={`/blogs/${blog.id}`} variant="h6" underline="hover">{blog.title}</Link>
                <Typography color="text.secondary">by {blog.author || 'Unknown author'}</Typography>
                <Typography sx={{ mt: 1 }}>Likes: {blog.likes}</Typography>
              </Paper>)}
            </Stack>
          </>} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginForm
            username={username} password={password} onUsername={setUsername} onPassword={setPassword}
            pending={loginPending} onSubmit={handleLogin}
          />} />
          <Route path="/blogs/new" element={!user ? <Navigate to="/login" replace /> : <>
            {loadStatus}
            {hasLoaded && !loading && !loadError && <BlogForm onCreate={handleCreate} onCancel={() => navigate('/')} pending={createPending} />}
          </>} />
          <Route path="/blogs/:id" element={<>
            {loadStatus}
            {!loading && !loadError && hasLoaded && <BlogPage blogs={blogs} ownerId={user?.id} busyIds={busyIds} onLike={handleLike} onDelete={handleDelete} />}
          </>} />
          <Route path="*" element={<Stack spacing={2}><Typography variant="h4" component="h1">Page not found</Typography><Link component={RouterLink} to="/">Back to blogs</Link></Stack>} />
        </Routes>
      </Container>
    </>
  )
}
