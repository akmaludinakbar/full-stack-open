import { useEffect, useState } from 'react'
import { getCountries, getWeather } from './services/api'

const conditions = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  66: 'Light freezing rain', 67: 'Heavy freezing rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
}

function Weather({ country }) {
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(false)
  const coordinates = country.capitalInfo?.latlng
  useEffect(() => {
    if (!coordinates?.length) return undefined
    let active = true
    getWeather(coordinates)
      .then(data => { if (active) setWeather(data) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [country, coordinates])
  return <section>
    <h3>Weather in {country.capital?.[0] ?? 'the capital'}</h3>
    {!coordinates?.length ? <p>Capital coordinates unavailable.</p>
      : error ? <p role="alert">Weather unavailable. Please try again later.</p>
        : !weather ? <p>Loading weather…</p>
          : <div>
            <p>Temperature {weather.current.temperature_2m} {weather.current_units.temperature_2m}</p>
            <p>Wind {weather.current.wind_speed_10m} {weather.current_units.wind_speed_10m}</p>
            <p>Condition: {conditions[weather.current.weather_code] ?? `Code ${weather.current.weather_code}`}</p>
          </div>}
    <small>Weather data: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></small>
  </section>
}

function Country({ country }) {
  return <article>
    <h2>{country.name.common}</h2>
    <p>Capital: {country.capital?.[0] ?? 'Unavailable'}</p>
    <p>Area: {country.area}</p>
    <h3>Languages</h3>
    <ul>{Object.entries(country.languages ?? {}).map(([code, language]) => <li key={code}>{language}</li>)}</ul>
    {country.flags?.png && <img className="flag" src={country.flags.png} alt={country.flags.alt ?? `Flag of ${country.name.common}`} />}
    <Weather country={country} />
  </article>
}

export default function App() {
  const [countries, setCountries] = useState([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    getCountries()
      .then(data => { if (active) setCountries(data) })
      .catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const changeQuery = event => { setQuery(event.target.value); setSelected(null) }
  const matches = countries.filter(country => country.name.common.toLowerCase().includes(query.trim().toLowerCase()))
  const single = selected ?? (matches.length === 1 ? matches[0] : null)
  return <main>
    <h1>Countries</h1>
    <label>Find countries <input value={query} onChange={changeQuery} /></label>
    {loading ? <p>Loading countries…</p> : error ? <p role="alert">Could not load countries. Please reload later.</p>
      : !query.trim() ? <p>Type a country name to begin.</p>
        : single ? <Country key={single.cca3} country={single} />
          : matches.length > 10 ? <p>Too many matches. Make the query more specific.</p>
            : matches.length === 0 ? <p>No countries match that query.</p>
              : <ul>{matches.map(country => <li key={country.cca3}>{country.name.common} <button type="button" onClick={() => setSelected(country)} aria-label={`Show ${country.name.common}`}>Show</button></li>)}</ul>}
    <small>Country data: <a href="https://studies.cs.helsinki.fi/restcountries/" target="_blank" rel="noreferrer">University of Helsinki REST Countries</a></small>
  </main>
}
