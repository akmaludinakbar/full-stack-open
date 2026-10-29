import { useState } from 'react'

export default function BlogForm({ onCreate, onCancel, pending }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  function submit(event) {
    event.preventDefault()
    if (pending) return
    void onCreate({ title, author, url })
  }

  return (
    <form aria-label="Create blog" onSubmit={submit} className="panel form">
      <h2>Create a blog</h2>
      <label>Title <input value={title} onChange={event => setTitle(event.target.value)} required /></label>
      <label>Author <input value={author} onChange={event => setAuthor(event.target.value)} /></label>
      <label>URL <input type="url" value={url} onChange={event => setUrl(event.target.value)} required /></label>
      <div className="actions">
        <button type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create'}</button>
        <button type="button" onClick={onCancel} disabled={pending}>Cancel</button>
      </div>
    </form>
  )
}
