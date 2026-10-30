import { test, expect } from '@playwright/test'
import { user, resetAndCreateUser, login, createBlog, blogRow, likeTimes } from './helpers.js'

let runtimeErrors
test.beforeEach(async ({ page, request }) => {
  runtimeErrors = []
  page.on('pageerror', error => runtimeErrors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  await resetAndCreateUser(request)
  await page.goto('/')
})

test.afterEach(async ({}, testInfo) => {
  const unexpected = runtimeErrors.filter(message => !(testInfo.title.includes('invalid credentials') && /Failed to load resource.*401/.test(message)))
  expect(unexpected, 'Unexpected browser runtime/console errors').toEqual([])
})

// Each case catches a missing or broken user-visible contract through the real API.
test('5.17/5.28: public navigation opens the login form', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Blogs', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL('/login')
  const form = page.getByRole('form', { name: 'Log in', exact: true })
  await expect(form.getByLabel('Username')).toBeVisible()
  await expect(form.getByLabel('Password')).toHaveAttribute('type', 'password')
  await expect(form.getByRole('button', { name: 'Log in', exact: true })).toBeVisible()
})

test('5.18: valid credentials log in and preserve the session on reload', async ({ page }) => {
  await login(page)
  await expect(page.getByText('Browser User logged in', { exact: true })).toBeVisible()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('form', { name: 'Log in', exact: true })).toHaveCount(0)
  await page.reload()
  await expect(page.getByText('Browser User logged in', { exact: true })).toBeVisible()
})

test('5.18: invalid credentials show a login error and leave the form available', async ({ page }) => {
  await login(page, { ...user, password: 'wrong-password' })
  await expect(page.getByRole('alert')).toHaveText('Login failed: invalid username or password')
  await expect(page.getByRole('form', { name: 'Log in', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Log out', exact: true })).toHaveCount(0)
})

test.describe('when logged in', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await expect(page.getByText('Browser User logged in', { exact: true })).toBeVisible()
  })

  test('5.19: a newly created blog is listed and survives reload', async ({ page }) => {
    await createBlog(page, 'Created in Chromium')
    await expect(blogRow(page, 'Created in Chromium')).toContainText('Synthetic Author')
    await page.reload()
    await expect(blogRow(page, 'Created in Chromium')).toBeVisible()
  })

  test('5.20: liking a blog updates and persists its like count', async ({ page }) => {
    await createBlog(page, 'A likable blog')
    const row = blogRow(page, 'A likable blog')
    await row.getByRole('link', { name: 'A likable blog', exact: true }).click()
    await expect(page).toHaveURL(/\/blogs\/[a-f0-9]+$/)
    await expect(row.getByText(/^Likes: 0$/)).toBeVisible()
    await likeTimes(row, 1)
    await page.reload()
    await expect(row.getByText(/^Likes: 1$/)).toBeVisible()
  })

  test('5.21: the creator can confirm deletion and the blog stays deleted', async ({ page, request }) => {
    await createBlog(page, 'Delete this blog')
    const row = blogRow(page, 'Delete this blog')
    await row.getByRole('link', { name: 'Delete this blog', exact: true }).click()
    const dialogPromise = page.waitForEvent('dialog')
    const click = row.getByRole('button', { name: 'Delete', exact: true }).click()
    const dialog = await dialogPromise
    expect(dialog.type()).toBe('confirm')
    expect(dialog.message()).toBe('Delete Delete this blog?')
    await dialog.accept()
    await click
    await expect(page).toHaveURL('/')
    await expect(row).toHaveCount(0)
    await expect(page.getByRole('alert')).toHaveText('Deleted Delete this blog')
    const response = await request.get('/api/blogs')
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual([])
    await page.reload()
    await expect(row).toHaveCount(0)
  })

  test('5.22: another user sees the blog details without Delete', async ({ page, request }) => {
    await createBlog(page, 'Owned by the first user')
    const other = { username: 'other-user', name: 'Other User', password: 'synthetic-other-password' }
    expect((await request.post('/api/users', { data: other })).status()).toBe(201)
    await page.getByRole('button', { name: 'Log out', exact: true }).click()
    await expect(page).toHaveURL('/')
    await login(page, other)
    await expect(page.getByText('Other User logged in', { exact: true })).toBeVisible()
    const row = blogRow(page, 'Owned by the first user')
    await row.getByRole('link', { name: 'Owned by the first user', exact: true }).click()
    await expect(row.getByText('Added by Browser User', { exact: true })).toBeVisible()
    await expect(row.getByRole('button', { name: 'Like', exact: true })).toBeVisible()
    await expect(row.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(0)
  })

  test('5.23: blogs are ordered by descending likes after each update', async ({ page }) => {
    for (const [title, count] of [['Middle blog', 2], ['Least liked blog', 1], ['Most liked blog', 3]]) {
      await createBlog(page, title)
      await blogRow(page, title).getByRole('link', { name: title, exact: true }).click()
      await likeTimes(blogRow(page, title), count)
      await page.getByRole('link', { name: 'Blogs', exact: true }).click()
    }
    await expect(page.getByRole('article').getByRole('link')).toHaveText([
      'Most liked blog', 'Middle blog', 'Least liked blog',
    ])
    await page.reload()
    await expect(page.getByRole('article').getByRole('link')).toHaveText([
      'Most liked blog', 'Middle blog', 'Least liked blog',
    ])
  })
})


test('5.24–5.27: guests can reload a direct detail URL without mutation controls', async ({ page }) => {
  await login(page)
  await createBlog(page, 'Public story')
  await blogRow(page, 'Public story').getByRole('link', { name: 'Public story', exact: true }).click()
  const detailUrl = page.url()
  await page.getByRole('button', { name: 'Log out', exact: true }).click()
  await expect(page).toHaveURL('/')
  await page.goto(detailUrl)
  await expect(page.getByRole('heading', { name: 'Public story', exact: true })).toBeVisible()
  await expect(page.getByText('Likes: 0', { exact: true })).toBeVisible()
  await expect(page.getByRole('article').getByRole('button')).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Public story', exact: true })).toBeVisible()
})

test('5.26: direct guest creation is guarded and missing detail recovers to the list', async ({ page }) => {
  await page.goto('/blogs/new')
  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('form', { name: 'Create blog' })).toHaveCount(0)
  await page.goto('/blogs/missing')
  await expect(page.getByRole('heading', { name: 'Blog not found' })).toBeVisible()
  await page.getByRole('link', { name: 'Back to blogs' }).click()
  await expect(page).toHaveURL('/')
})
