import { afterEach, expect, test } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import App from './App'
import Course from './components/Course'

afterEach(cleanup)

test('renders each course, arbitrary parts, and the reduced total', () => {
  render(<App courses={[
    { id: 1, name: 'First course', parts: [{ id: 1, name: 'One', exercises: 2 }, { id: 2, name: 'Two', exercises: 3 }, { id: 3, name: 'Three', exercises: 4 }, { id: 4, name: 'Four', exercises: 5 }] },
    { id: 2, name: 'Second course', parts: [{ id: 5, name: 'Only part', exercises: 7 }] },
  ]} />)
  expect(screen.getByText('First course')).toBeTruthy()
  expect(screen.getByText('Four 5')).toBeTruthy()
  expect(screen.getByText('Second course')).toBeTruthy()
  expect(screen.getByText('Only part 7')).toBeTruthy()
  expect(screen.getByText('Total of 14 exercises')).toBeTruthy()
  expect(screen.getByText('Total of 7 exercises')).toBeTruthy()
})

test('a course with no parts has a zero total', () => {
  render(<Course course={{ id: 3, name: 'Empty', parts: [] }} />)
  expect(screen.getByText('Total of 0 exercises')).toBeTruthy()
})
