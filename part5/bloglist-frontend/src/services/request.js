export async function request(url, options = {}) {
  const response = await fetch(url, options)
  if (response.status === 204) return null
  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`Server returned an invalid response (${response.status})`)
  }
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`)
  return data
}
