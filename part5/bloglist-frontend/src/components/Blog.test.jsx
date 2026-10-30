import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Blog from './Blog'

const blog = { id: 'b1', title: 'Testing React', author: 'Ada', url: 'https://example.com/react', likes: 7, user: { id: 'u1', name: 'Alice', username: 'alice' } }
afterEach(cleanup)

describe('single blog (5.27)', () => {
  it('lets guests read all details and likes without mutation buttons', () => {
    render(<Blog blog={blog} />)
    expect(screen.getByText('Testing React')).toBeTruthy()
    expect(screen.getByText(/Ada/)).toBeTruthy()
    expect(screen.getByRole('link', { name: blog.url }).getAttribute('href')).toBe(blog.url)
    expect(screen.getByText('Likes: 7')).toBeTruthy()
    expect(screen.getByText('Added by Alice')).toBeTruthy()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
  it('lets a signed-in nonowner like twice without exposing Delete', async () => {
    const onLike = vi.fn()
    const user = userEvent.setup()
    render(<Blog blog={blog} ownerId="u2" onLike={onLike} />)
    await user.click(screen.getByRole('button', { name: 'Like', exact: true }))
    await user.click(screen.getByRole('button', { name: 'Like', exact: true }))
    expect(onLike).toHaveBeenCalledTimes(2)
    expect(onLike).toHaveBeenNthCalledWith(1, blog)
    expect(onLike).toHaveBeenNthCalledWith(2, blog)
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
  })
  it('lets the creator delete and disables both mutations while busy', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    const view = render(<Blog blog={blog} ownerId="u1" onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith(blog)
    view.rerender(<Blog blog={blog} ownerId="u1" busy onDelete={onDelete} />)
    expect(screen.getByRole('button', { name: 'Like', exact: true }).disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Delete' }).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
