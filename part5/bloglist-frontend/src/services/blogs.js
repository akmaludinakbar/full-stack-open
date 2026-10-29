import { request } from './request'

let token = null

export function setToken(nextToken) {
  token = nextToken
}

function jsonHeaders(authenticated = false) {
  return {
    'Content-Type': 'application/json',
    ...(authenticated ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export function getBlogs() {
  return request('/api/blogs')
}

export function createBlog(details) {
  return request('/api/blogs', {
    method: 'POST',
    headers: jsonHeaders(true),
    body: JSON.stringify(details),
  })
}

export function likeBlog(blog) {
  return request(`/api/blogs/${blog.id}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify({
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes + 1,
      user: blog.user?.id,
    }),
  })
}

export function deleteBlog(id) {
  return request(`/api/blogs/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}
