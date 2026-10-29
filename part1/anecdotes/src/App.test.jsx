import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

test('a vote belongs to the selected anecdote and the leader updates', () => {
  vi.spyOn(Math, 'random').mockReturnValueOnce(0.2)
  render(<App />)

  const selected = screen.getByRole('region', { name: 'Anecdote of the day' })
  const leader = screen.getByRole('region', { name: 'Anecdote with most votes' })
  expect(within(leader).getByText('If it hurts, do it more often.')).toBeTruthy()
  expect(leader.textContent).toContain('has 0 votes')

  fireEvent.click(screen.getByRole('button', { name: 'vote' }))
  expect(selected.textContent).toContain('has 1 vote')
  expect(leader.textContent).toContain('If it hurts, do it more often.')

  fireEvent.click(screen.getByRole('button', { name: 'next anecdote' }))
  expect(selected.textContent).toContain('Adding manpower to a late software project makes it later!')
  expect(selected.textContent).toContain('has 0 votes')

  fireEvent.click(screen.getByRole('button', { name: 'vote' }))
  expect(leader.textContent).toContain('If it hurts, do it more often.')
  fireEvent.click(screen.getByRole('button', { name: 'vote' }))
  expect(selected.textContent).toContain('has 2 votes')
  expect(leader.textContent).toContain('Adding manpower to a late software project makes it later!')
  expect(leader.textContent).toContain('has 2 votes')
})
