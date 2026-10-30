import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

const blog = {
  id: 'b1',
  title: 'Testing React components',
  author: 'Ada Lovelace',
  url: 'https://example.com/react-testing',
  likes: 7,
  user: { id: 'u1', username: 'ada', name: 'Ada Lovelace' },
}

afterEach(cleanup)

describe('Blog component exercises 5.13–5.15', () => {
  it('initially shows title and author while hiding URL and likes', () => {
    render(<Blog blog={blog} ownerId="u1" busy={false} onLike={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Testing React components')).toBeTruthy()
    expect(screen.getByText(/by Ada Lovelace/)).toBeTruthy()
    expect(screen.queryByText('https://example.com/react-testing')).toBeNull()
    expect(screen.queryByText(/Likes:/)).toBeNull()
  })

  it('reveals the URL and like count after View is clicked', async () => {
    const user = userEvent.setup()
    render(<Blog blog={blog} ownerId="u1" busy={false} onLike={vi.fn()} onDelete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'View' }))

    expect(screen.getByRole('link', { name: 'https://example.com/react-testing' }).getAttribute('href')).toBe('https://example.com/react-testing')
    expect(screen.getByText('Likes: 7')).toBeTruthy()
  })

  it('invokes the supplied handler once for each of two sequential Like clicks', async () => {
    const user = userEvent.setup()
    const onLike = vi.fn()
    render(<Blog blog={blog} ownerId="u1" busy={false} onLike={onLike} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'View' }))

    await user.click(screen.getByRole('button', { name: 'Like' }))
    expect(onLike).toHaveBeenCalledTimes(1)
    expect(onLike).toHaveBeenNthCalledWith(1, blog)

    await user.click(screen.getByRole('button', { name: 'Like' }))
    expect(onLike).toHaveBeenCalledTimes(2)
    expect(onLike).toHaveBeenNthCalledWith(2, blog)
  })
})
