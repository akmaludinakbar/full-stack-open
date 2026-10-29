const countriesUrl = 'https://studies.cs.helsinki.fi/restcountries/api/all'
const weatherUrl = 'https://api.open-meteo.com/v1/forecast'

async function json(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json()
}

export const getCountries = () => json(countriesUrl)

export const getWeather = ([latitude, longitude]) => {
  const params = new URLSearchParams({
    latitude: String(latitude), longitude: String(longitude),
    current: 'temperature_2m,wind_speed_10m,weather_code', timezone: 'auto',
  })
  return json(`${weatherUrl}?${params}`)
}
