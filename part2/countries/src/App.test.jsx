import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import App from './App'
import { getCountries, getWeather } from './services/api'

vi.mock('./services/api', () => ({ getCountries: vi.fn(), getWeather: vi.fn() }))
const finland = { cca3: 'FIN', name: { common: 'Finland' }, capital: ['Helsinki'], area: 338424, languages: { fin: 'Finnish', swe: 'Swedish' }, flags: { png: 'https://flagcdn.com/w320/fi.png', alt: 'Finnish flag' }, capitalInfo: { latlng: [60.17, 24.93] } }
const ireland = { ...finland, cca3: 'IRL', name: { common: 'Ireland' }, capital: ['Dublin'] }
beforeEach(() => {
  vi.clearAllMocks()
  getCountries.mockResolvedValue([finland, ireland])
  getWeather.mockResolvedValue({ current: { temperature_2m: 8, wind_speed_10m: 12, weather_code: 3 }, current_units: { temperature_2m: '°C', wind_speed_10m: 'km/h' } })
})
afterEach(cleanup)
const query = value => fireEvent.change(screen.getByLabelText('Find countries'), { target: { value } })

test('shows an empty prompt, multiple choices, and a selected country with weather', async () => {
  render(<App />)
  expect(await screen.findByText(/Type a country name/)).toBeTruthy()
  query('land')
  expect(await screen.findByText('Finland')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Show Finland' }))
  expect(await screen.findByText(/Capital: Helsinki/)).toBeTruthy()
  expect(screen.getByText(/Area: 338424/)).toBeTruthy()
  expect(screen.getByText('Finnish')).toBeTruthy()
  expect((await screen.findByAltText('Finnish flag')).getAttribute('src')).toContain('fi.png')
  expect(await screen.findByText(/8 °C/)).toBeTruthy()
  expect(screen.getByText(/12 km\/h/)).toBeTruthy()
})

test('asks for a narrower query and explains a no-match query', async () => {
  getCountries.mockResolvedValue(Array.from({ length: 11 }, (_, i) => ({ ...finland, cca3: `F${i}`, name: { common: `Land ${i}` } })))
  render(<App />)
  query('land')
  expect(await screen.findByText(/Too many matches/)).toBeTruthy()
  query('xyz')
  expect(screen.getByText(/No countries match/)).toBeTruthy()
})

test('reports country and weather request errors', async () => {
  getCountries.mockRejectedValue(new Error('offline'))
  render(<App />)
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringMatching(/Could not load countries/))
  cleanup()
  getCountries.mockResolvedValue([finland])
  getWeather.mockRejectedValue(new Error('offline'))
  render(<App />)
  query('fin')
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringMatching(/Weather unavailable/))
})
