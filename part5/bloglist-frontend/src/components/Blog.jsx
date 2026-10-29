import { useState } from 'react'

export default function Blog({ blog, ownerId, busy, onLike, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <article className="panel blog">
      <div className="blog-heading">
        <span><strong>{blog.title}</strong> by {blog.author || 'Unknown author'}</span>
        <button type="button" onClick={() => setExpanded(value => !value)}>{expanded ? 'Hide' : 'View'}</button>
      </div>
      {expanded && (
        <div className="blog-details">
          <a href={blog.url} target="_blank" rel="noreferrer">{blog.url}</a>
          <div>Likes: {blog.likes} <button type="button" onClick={() => onLike(blog)} disabled={busy}>Like</button></div>
          <div>Added by {blog.user?.name || blog.user?.username || 'Unknown user'}</div>
          {blog.user?.id === ownerId && <button type="button" onClick={() => onDelete(blog)} disabled={busy}>Delete</button>}
        </div>
      )}
    </article>
  )
}
