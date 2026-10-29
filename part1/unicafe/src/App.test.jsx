import { afterEach, expect, test } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import App from './App'

afterEach(cleanup)

test('statistics appear after feedback and calculate all three measures', () => {
  render(<App />)

  expect(screen.getByText('No feedback given')).toBeTruthy()
  expect(screen.queryByRole('table')).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'good' }))
  fireEvent.click(screen.getByRole('button', { name: 'good' }))
  fireEvent.click(screen.getByRole('button', { name: 'neutral' }))
  fireEvent.click(screen.getByRole('button', { name: 'bad' }))

  expect(screen.queryByText('No feedback given')).toBeNull()
  expect(screen.getByRole('row', { name: 'good 2' })).toBeTruthy()
  expect(screen.getByRole('row', { name: 'neutral 1' })).toBeTruthy()
  expect(screen.getByRole('row', { name: 'bad 1' })).toBeTruthy()
  expect(screen.getByRole('row', { name: 'all 4' })).toBeTruthy()
  expect(screen.getByRole('row', { name: 'average 0.25' })).toBeTruthy()
  expect(screen.getByRole('row', { name: 'positive 50 %' })).toBeTruthy()
})

test('bad-only feedback yields a negative average and zero positive share', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'bad' }))

  expect(screen.getByRole('row', { name: 'average -1' })).toBeTruthy()
  expect(screen.getByRole('row', { name: 'positive 0 %' })).toBeTruthy()
})
