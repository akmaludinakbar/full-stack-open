import { expect } from '@playwright/test'

export const user = { username: 'browser-user', name: 'Browser User', password: 'synthetic-password-123' }

export async function resetAndCreateUser(request) {
  // A relative URL always uses this project's dedicated local Vite proxy.
  expect((await request.post('/api/testing/reset')).status()).toBe(204)
  expect((await request.post('/api/users', { data: user })).status()).toBe(201)
}

export async function login(page, credentials = user) {
  const form = page.getByRole('form', { name: 'Log in', exact: true })
  await form.getByLabel('Username').fill(credentials.username)
  await form.getByLabel('Password').fill(credentials.password)
  await form.getByRole('button', { name: 'Log in', exact: true }).click()
}

export function blogRow(page, title) {
  return page.getByRole('article').filter({ has: page.getByText(title, { exact: true }) })
}

export async function createBlog(page, title, author = 'Synthetic Author') {
  await page.getByRole('button', { name: 'New blog', exact: true }).click()
  const form = page.getByRole('form', { name: 'Create blog', exact: true })
  await form.getByLabel('Title', { exact: true }).fill(title)
  await form.getByLabel('Author', { exact: true }).fill(author)
  await form.getByLabel('URL', { exact: true }).fill('https://example.test/browser-blog')
  await form.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(blogRow(page, title)).toBeVisible()
}

export async function likeTimes(row, count) {
  for (let likes = 1; likes <= count; likes += 1) {
    await row.getByRole('button', { name: 'Like', exact: true }).click()
    await expect(row.getByText(new RegExp(`^Likes: ${likes} Like$`))).toBeVisible()
    await expect(row.getByRole('button', { name: 'Like', exact: true })).toBeEnabled()
  }
}
