import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

afterEach(cleanup)

describe('BlogForm component exercise 5.16', () => {
  it('submits the entered title, author and URL to onCreate', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(<BlogForm onCreate={onCreate} onCancel={vi.fn()} pending={false} />)

    await user.type(screen.getByLabelText('Title'), 'Testing user interactions')
    await user.type(screen.getByLabelText('Author'), 'Grace Hopper')
    await user.type(screen.getByLabelText('URL'), 'https://example.com/user-interactions')
    expect(onCreate).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(onCreate).toHaveBeenCalledTimes(1)
    expect(onCreate).toHaveBeenCalledWith({
      title: 'Testing user interactions',
      author: 'Grace Hopper',
      url: 'https://example.com/user-interactions',
    })
  })
})
