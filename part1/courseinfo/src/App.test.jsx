import { afterEach, expect, test } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Total } from './App'

afterEach(cleanup)

test('total uses the supplied exercise counts instead of a fixed sample value', () => {
  render(<Total parts={[
    { name: 'First', exercises: 2 },
    { name: 'Second', exercises: 7 },
    { name: 'Third', exercises: 4 },
  ]} />)

  expect(screen.getByText('Number of exercises 13')).toBeTruthy()
})
